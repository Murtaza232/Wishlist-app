<?php

namespace App\Http\Controllers;

use App\Mail\SendEmail;
use App\Models\ImagesSwap;
use App\Models\Lineitem;
use App\Models\Session;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use SebastianBergmann\Diff\Line;

class SwapImageController extends Controller
{
    public function createTransparentWatermark($text = "FACESWAP", $outputPath = null)
    {
        if ($outputPath === null) {
            $outputPath = public_path('watermark.png');
        }

        // Create transparent base image
        $width = 400;
        $height = 100;
        $image = imagecreatetruecolor($width, $height);

        // Make the background fully transparent
        imagealphablending($image, false);
        imagesavealpha($image, true);
        $transparent = imagecolorallocatealpha($image, 0, 0, 0, 127);
        imagefill($image, 0, 0, $transparent);

        // Switch to blending mode for text rendering
        imagealphablending($image, true);

        // Add semi-transparent background for text area
        $bgColor = imagecolorallocatealpha($image, 0, 0, 0, 80); // Semi-transparent black
        imagefilledrectangle($image, 0, 0, $width, $height, $bgColor);

        // Add text
        $textColor = imagecolorallocatealpha($image, 255, 255, 255, 0); // Solid white
        $fontSize = 5;

        // Center the text
        $textWidth = strlen($text) * imagefontwidth($fontSize);
        $textHeight = imagefontheight($fontSize);
        $x = ($width - $textWidth) / 2;
        $y = ($height - $textHeight) / 2 + $textHeight;

        // Add text
        imagestring($image, $fontSize, $x, $y - 10, $text, $textColor);

        // Save with full alpha channel support
        imagesavealpha($image, true);
        imagepng($image, $outputPath);
        imagedestroy($image);

        return file_exists($outputPath);
    }

    /**
     * Generate watermark via route
     *
     * @return string Success message
     */
    public function generateWatermark()
    {
        $result = $this->createTransparentWatermark("FACESWAP", public_path('watermark.png'));
        return $result ? "Watermark created successfully!" : "Failed to create watermark.";
    }

    /**
     * Process a face swap request
     *
     * @param Request $request The request containing swap_image and target_image URLs
     * @return \Illuminate\Http\JsonResponse Response with the final image URL or error
     */



    public function SwapImageLoop(Request $request)
    {


        try {
            $setting = Setting::first();
            $swapImage = $request->file('swap_image');

            if (!$swapImage || !$swapImage->isValid()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Uploaded swap image is invalid.',
                ]);
            }
            $mediaId = Str::random(20);

            // Save uploaded image
            $swapFileName = 'swap_' . Str::uuid() . '.' . $swapImage->getClientOriginalExtension();
            $originalDir = public_path('originalpic');
            if (!file_exists($originalDir)) mkdir($originalDir, 0777, true);
            $swapImage->move($originalDir, $swapFileName);
            $swapImagePath = $originalDir . '/' . $swapFileName;
            $swapImageUrl = url('originalpic/' . $swapFileName);

            $finalImageUrl = null;

            // ------------------- MAGIC API FLOW -------------------
            if ($setting->type === 'magic_api') {
                $response = Http::withHeaders([
                    'accept' => 'application/json',
                    'x-magicapi-key' => $setting->magic_api_key,
                    'Content-Type' => 'application/json',
                ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/faceswap-image', [
                    'input' => [
                        'swap_image' => $swapImageUrl,
                        'target_image' => $request->target_image,
                    ]
                ]);

                $requestId = $response->json()['request_id'] ?? null;
                if (!$requestId) throw new \Exception('Request ID not received from MagicAPI');

                // Poll for result
                $finalImageUrl = null;
                $maxAttempts = 10;
                $attempt = 0;
                $delay = 5; // seconds

                do {
                    sleep($delay);
                    $attempt++;

                    $resultResponse = Http::withHeaders([
                        'accept' => 'application/json',
                        'x-magicapi-key' => $setting->magic_api_key,
                        'Content-Type' => 'application/json',
                    ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/result', [
                        'request_id' => $requestId
                    ]);

                    $status = $resultResponse->json()['status'] ?? null;

                    if ($status === 'processed') {
                        $finalImageUrl = $resultResponse->json()['output'] ?? null;
                        break;
                    }

                } while ($status === 'processing' && $attempt < $maxAttempts);

                if (!$finalImageUrl) {
                    throw new \Exception('Image processing not completed or output not found from MagicAPI.');
                }
            }


            // ------------------- DEEPFACESWAP FLOW -------------------
            elseif ($setting->type === 'deepfaceswap') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $setting->deepface_api_key,
                ])
                    ->attach('swap[source_resource][file]', file_get_contents($swapImagePath), 'source.jpg')
                    ->attach('swap[target_resource][file]', file_get_contents($request->target_image), 'target.jpg')
                    ->post('https://deepfaceswap.ai/api/v1/swaps');

                if (!$response->successful()) {
                    return response()->json([
                        'success' => false,
                        'error' => $response->body(),
                    ], $response->status());
                }

                $swapId = $response->json()['id'];
                $maxAttempts = 10;
                $attempt = 0;
                $delay = 10;

                do {
                    sleep($delay);
                    $attempt++;
                    $statusResponse = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $setting->deepface_api_key,
                    ])->get("https://deepfaceswap.ai/api/v1/swaps/{$swapId}");

                    if (!$statusResponse->successful()) {
                        return response()->json([
                            'success' => false,
                            'error' => $statusResponse->body(),
                        ], $statusResponse->status());
                    }

                    $statusData = $statusResponse->json();
                } while ($statusData['status'] !== 'completed' && $attempt < $maxAttempts);

                if ($statusData['status'] !== 'completed' || empty($statusData['output_resource']['url'])) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Swap failed or result not found.',
                    ]);
                }

                $finalImageUrl = $statusData['output_resource']['url'];
            }

            // ------------------- COMMON: SAVE IMAGE -------------------
            $imageContents = file_get_contents($finalImageUrl);
            if (!$imageContents) throw new \Exception('Failed to download the output image.');

            $faceswapsDir = public_path('arttransformer');
            $rawFaceswapsDir = public_path('rawfaceswaps');
            if (!file_exists($faceswapsDir)) mkdir($faceswapsDir, 0777, true);
            if (!file_exists($rawFaceswapsDir)) mkdir($rawFaceswapsDir, 0777, true);

            $fileName = 'arttransformer_' . Str::uuid() . '.jpg';
            $rawFileName = 'faceswap_raw_' . Str::uuid() . '.jpg';

            $imagePath = $faceswapsDir . '/' . $fileName;
            $rawImagePath = $rawFaceswapsDir . '/' . $rawFileName;

            $finalImage = imagecreatefromstring($imageContents);
            if (!$finalImage) throw new \Exception('Failed to create image from contents.');

            // Resize if image is too wide
            $maxWidth = 1024;
            $width = imagesx($finalImage);
            $height = imagesy($finalImage);

            if ($width > $maxWidth) {
                $ratio = $maxWidth / $width;
                $newWidth = $maxWidth;
                $newHeight = intval($height * $ratio);

                $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
                imagecopyresampled($resizedImage, $finalImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                imagejpeg($resizedImage, $imagePath, 85);
                imagejpeg($resizedImage, $rawImagePath, 85); // Save raw
                imagedestroy($resizedImage);
            } else {
                imagejpeg($finalImage, $imagePath, 85);
                imagejpeg($finalImage, $rawImagePath, 85); // Save raw
            }
            imagedestroy($finalImage);

            // ------------------- COMMON: ADD WATERMARK -------------------
            $watermarkPath = public_path('watermark.png');
            if (!file_exists($watermarkPath)) {
                $this->createTransparentWatermark("FACESWAP", $watermarkPath);
            }

            if (file_exists($watermarkPath)) {
                $baseImage = imagecreatefromjpeg($imagePath);
                $watermark = imagecreatefrompng($watermarkPath);

                if ($baseImage && $watermark) {
                    imagealphablending($baseImage, true);
                    imagealphablending($watermark, true);
                    imagesavealpha($watermark, true);

                    $baseWidth = imagesx($baseImage);
                    $baseHeight = imagesy($baseImage);
                    $wmWidth = imagesx($watermark);
                    $wmHeight = imagesy($watermark);

                    $destX = $baseWidth - $wmWidth - 20;
                    $destY = $baseHeight - $wmHeight - 20;

                    imagecopy($baseImage, $watermark, $destX, $destY, 0, 0, $wmWidth, $wmHeight);
                    imagejpeg($baseImage, $imagePath, 90);

                    imagedestroy($baseImage);
                    imagedestroy($watermark);
                }
            }

            // ------------------- SAVE TO DATABASE -------------------
            ImagesSwap::create([
                'media_id' => $mediaId,
                'original_image' => url('originalpic/' . $swapFileName),
                'swapped_image_with_water_mark' => url('arttransformer/' . $fileName),
                'swapped_image_without_water_mark' => url('rawfaceswaps/' . $rawFileName),
                'type' => $setting->type,
            ]);

            // ------------------- RETURN FINAL URL -------------------
            return response()->json([
                'success' => true,
                'media_id' => $mediaId,
                'url' => url('arttransformer/' . $fileName),
            ]);

        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'error' => $exception->getMessage(),
            ]);
        }
    }


    public function SwapImage(Request $request)
    {
        try {
            $setting = Setting::first();
            $swapImage = $request->file('swap_image');

            if (!$swapImage || !$swapImage->isValid()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Uploaded swap image is invalid.',
                    'status' => 'failed'
                ]);
            }

            $swapFileName = 'swap_' . Str::uuid() . '.' . $swapImage->getClientOriginalExtension();
            $originalDir = public_path('originalpic');
            if (!file_exists($originalDir)) mkdir($originalDir, 0777, true);
            $swapImage->move($originalDir, $swapFileName);
            $swapImagePath = $originalDir . '/' . $swapFileName;
            $swapImageUrl = url('originalpic/' . $swapFileName);

            $finalImageUrl = null;
            $mediaId = null;

            // MAGIC API FLOW
            if ($setting->type === 'magic_api') {
                $response = Http::withHeaders([
                    'accept' => 'application/json',
                    'x-magicapi-key' => $setting->magic_api_key,
                    'Content-Type' => 'application/json',
                ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/faceswap-image', [
                    'input' => [
                        'swap_image' => $swapImageUrl,
                        'target_image' => $request->target_image,
                    ]
                ]);

                $requestId = $response->json()['request_id'] ?? null;

                if (!$requestId) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Request ID not received from MagicAPI',
                        'media_id' => null,
                        'url' => null,
                        'watermark_base64' => null,
                        'status' => 'failed'
                    ]);
                }

                $mediaId = $requestId;
                sleep(20);

                $resultResponse = Http::withHeaders([
                    'accept' => 'application/json',
                    'x-magicapi-key' => $setting->magic_api_key,
                    'Content-Type' => 'application/json',
                ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/result', [
                    'request_id' => $requestId
                ]);

                $status = $resultResponse->json()['status'] ?? null;
                if ($status === 'processed') {
                    $finalImageUrl = $resultResponse->json()['output'] ?? null;
                } else {
                    if ($mediaId) {
                        ImagesSwap::create([
                            'media_id' => $mediaId,
                            'type' => $setting->type,
                            'original_image' => url('originalpic/' . $swapFileName),
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'error' => 'Image processing not completed or output not found.',
                        'media_id' => $mediaId,
                        'url' => null,
                        'watermark_base64' => null,
                        'status' => 'in-progress'
                    ]);
                }
            }

            // DEEPFACESWAP FLOW
            elseif ($setting->type === 'deepfaceswap') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $setting->deepface_api_key,
                ])
                    ->attach('swap[source_resource][file]', file_get_contents($swapImagePath), 'source.jpg')
                    ->attach('swap[target_resource][file]', file_get_contents($request->target_image), 'target.jpg')
                    ->post('https://deepfaceswap.ai/api/v1/swaps');


                if (!$response->successful()) {
                    return response()->json([
                        'success' => false,
                        'error' => $response->body(),
                        'status' => 'failed'
                    ], $response->status());
                }

                $swapId = $response->json()['id'];
                $mediaId = $swapId;

                sleep(20);

                $statusResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $setting->deepface_api_key,
                ])->get("https://deepfaceswap.ai/api/v1/swaps/{$swapId}");


                $check_response=$statusResponse->json();

                if($check_response['status']=='failed'){
                    return response()->json([
                        'success' => false,
                        'error' => 'Image cannot be processed',
                        'status' => 'failed'
                    ], $statusResponse->status());
                }
                if (!$statusResponse->successful()) {
                    return response()->json([
                        'success' => false,
                        'error' => $statusResponse->body(),
                        'status' => 'failed'
                    ], $statusResponse->status());
                }

                $statusData = $statusResponse->json();
                if ($statusData['status'] !== 'completed' || empty($statusData['output_resource']['url'])) {
                    if ($mediaId) {
                        ImagesSwap::create([
                            'media_id' => $mediaId,
                            'type' => $setting->type,
                            'original_image' => url('originalpic/' . $swapFileName),
                        ]);
                    }

                    return response()->json([
                        'success' => false,
                        'error' => 'Image processing not completed or output not found.',
                        'media_id' => $mediaId,
                        'url' => null,
                        'watermark_base64' => null,
                        'status' => 'in-progress'
                    ]);
                }

                $finalImageUrl = $statusData['output_resource']['url'];
            }

            // SAVE FINAL IMAGE
            $imageContents = file_get_contents($finalImageUrl);
            if (!$imageContents) throw new \Exception('Failed to download the output image.');

            $faceswapsDir = public_path('arttransformer');
            $rawFaceswapsDir = public_path('rawfaceswaps');
            if (!file_exists($faceswapsDir)) mkdir($faceswapsDir, 0777, true);
            if (!file_exists($rawFaceswapsDir)) mkdir($rawFaceswapsDir, 0777, true);

            $fileName = 'arttransformer_' . Str::uuid() . '.jpg';
            $rawFileName = 'faceswap_raw_' . Str::uuid() . '.jpg';

            $imagePath = $faceswapsDir . '/' . $fileName;
            $rawImagePath = $rawFaceswapsDir . '/' . $rawFileName;

            $finalImage = imagecreatefromstring($imageContents);
            if (!$finalImage) throw new \Exception('Failed to create image from contents.');
//comment code for image size
//            $maxWidth = 1024;
//            $width = imagesx($finalImage);
//            $height = imagesy($finalImage);
//
//            if ($width > $maxWidth) {
//                $ratio = $maxWidth / $width;
//                $newWidth = $maxWidth;
//                $newHeight = intval($height * $ratio);
//
//                $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
//                imagecopyresampled($resizedImage, $finalImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
//                imagejpeg($resizedImage, $imagePath, 85);
//                imagejpeg($resizedImage, $rawImagePath, 85);
//                imagedestroy($resizedImage);
//            } else {
//                imagejpeg($finalImage, $imagePath, 85);
//                imagejpeg($finalImage, $rawImagePath, 85);
//            }
//
//            imagedestroy($finalImage);
            imagejpeg($finalImage, $imagePath, 85);
            imagejpeg($finalImage, $rawImagePath, 85);
            // ADD STRETCHED WATERMARK
            $watermarkPath = public_path('watermark.png');
            if (!file_exists($watermarkPath)) {
                $this->createTransparentWatermark("FACESWAP", $watermarkPath);
            }

            $watermarkBase64 = null;
            if (file_exists($watermarkPath)) {
                $baseImage = imagecreatefromjpeg($imagePath);
                $watermark = imagecreatefrompng($watermarkPath);

                if ($baseImage && $watermark) {
                    imagealphablending($baseImage, true);
                    imagesavealpha($baseImage, true);

                    $baseWidth = imagesx($baseImage);
                    $baseHeight = imagesy($baseImage);
                    $wmWidth = imagesx($watermark);
                    $wmHeight = imagesy($watermark);

                    for ($x = 0; $x < $baseWidth; $x += $wmWidth) {
                        for ($y = 0; $y < $baseHeight; $y += $wmHeight) {
                            imagecopy($baseImage, $watermark, $x, $y, 0, 0, $wmWidth, $wmHeight);
                        }
                    }
                    imagejpeg($baseImage, $imagePath, 90);

                    imagedestroy($baseImage);
                    imagedestroy($watermark);
                }

                $finalImageContents = file_get_contents($imagePath);
                $watermarkBase64 = 'data:image/jpeg;base64,' . base64_encode($finalImageContents);
            }

            // SAVE TO DATABASE
            ImagesSwap::create([
                'media_id' => $mediaId,
                'original_image' => url('originalpic/' . $swapFileName),
                'swapped_image_with_water_mark' => url('arttransformer/' . $fileName),
                'swapped_image_without_water_mark' => url('rawfaceswaps/' . $rawFileName),
                'type' => $setting->type,
            ]);

            return response()->json([
                'success' => true,
                'media_id' => $mediaId,
//                'url' => "https://feenchlet.com/a/art/show-image/{$mediaId}",
                'url' => url('arttransformer/' . $fileName),
//                'url' => null,
                'watermark_base64' => $watermarkBase64,
                'status' => 'complete'
            ]);

        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'error' => $exception->getMessage(),
                'media_id' => null,
                'url' => null,
                'watermark_base64' => null,
                'status' => 'failed'
            ]);
        }
    }




    public function GetImagesbyMediaId(Request $request)
    {
        try {
            if (!$request->has('media_id') || empty($request->media_id)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Missing parameter: media_id',
                    'media_id' => null,
                    'url' => null,
                    'watermark_base64' => null,
                    'status' => 'failed',
                ], 400); // 400 Bad Request
            }
            $image_swap = ImagesSwap::where('media_id', $request->media_id)->first();

            if (!$image_swap) {
                return response()->json([
                    'success' => false,
                    'error' => 'Record not found',
                    'media_id' => null,
                    'url' => null,
                    'watermark_base64' => null,
                    'status' => 'failed'
                ]);
            }

            // ✅ Already processed? Return from DB.
            if (!empty($image_swap->swapped_image_with_water_mark)) {
                $imagePath = public_path(parse_url($image_swap->swapped_image_with_water_mark, PHP_URL_PATH));

                if (file_exists($imagePath)) {
                    $imageData = file_get_contents($imagePath);
                    $base64 = 'data:image/jpeg;base64,' . base64_encode($imageData);

                    return response()->json([
                        'success' => true,
                        'media_id' => $image_swap->media_id,
                        'url' => $image_swap->swapped_image_with_water_mark,
                        'watermark_base64' => $base64,
                        'status' => 'complete'
                    ]);
                }
            }

            $setting = Setting::first();
            $finalImageUrl = null;
            $mediaId = $image_swap->media_id;

            if ($image_swap->type === 'magic_api') {
                $response = Http::withHeaders([
                    'accept' => 'application/json',
                    'x-magicapi-key' => $setting->magic_api_key,
                    'Content-Type' => 'application/json',
                ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/result', [
                    'request_id' => $mediaId
                ]);

                $status = $response->json()['status'] ?? null;
                if ($status !== 'processed') {
                    return $this->buildInProgressResponse($mediaId);
                }

                $finalImageUrl = $response->json()['output'] ?? null;
            } elseif ($setting->type === 'deepfaceswap') {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $setting->deepface_api_key,
                ])->get("https://deepfaceswap.ai/api/v1/swaps/{$mediaId}");

                if (!$response->successful()) {
                    return response()->json([
                        'success' => false,
                        'error' => $response->body(),
                        'status' => 'failed'
                    ], $response->status());
                }

                $data = $response->json();
                if ($data['status'] !== 'completed' || empty($data['output_resource']['url'])) {
                    return $this->buildInProgressResponse($mediaId);
                }

                $finalImageUrl = $data['output_resource']['url'];
            }

            if (!$finalImageUrl) {
                throw new \Exception('Final image URL is missing.');
            }

            [$urlWithWatermark, $urlWithoutWatermark, $base64] = $this->processSwappedImage($finalImageUrl);

            $image_swap->swapped_image_with_water_mark = $urlWithWatermark;
            $image_swap->swapped_image_without_water_mark = $urlWithoutWatermark;
            $image_swap->save();

            return response()->json([
                'success' => true,
                'media_id' => $mediaId,
                'url' => $urlWithWatermark,
//                'url' => null,
//                'url' => "https://feenchlet.com/a/art/show-image/{$mediaId}",
                'watermark_base64' => $base64,
                'status' => 'complete'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'media_id' => null,
                'url' => null,
                'watermark_base64' => null,
                'status' => 'failed'
            ]);
        }
    }

    private function buildInProgressResponse($mediaId)
    {
        return response()->json([
            'success' => false,
            'error' => 'Image processing not completed or output not found.',
            'media_id' => $mediaId,
            'url' => null,
            'watermark_base64' => null,
            'status' => 'in-progress'
        ]);
    }

    private function processSwappedImage($finalImageUrl)
    {
        $imageContents = file_get_contents($finalImageUrl);
        if (!$imageContents) throw new \Exception('Failed to download the output image.');

        $faceswapsDir = public_path('arttransformer');
        $rawFaceswapsDir = public_path('rawfaceswaps');
        if (!file_exists($faceswapsDir)) mkdir($faceswapsDir, 0777, true);
        if (!file_exists($rawFaceswapsDir)) mkdir($rawFaceswapsDir, 0777, true);

        $fileName = 'arttransformer_' . Str::uuid() . '.jpg';
        $rawFileName = 'faceswap_raw_' . Str::uuid() . '.jpg';

        $imagePath = $faceswapsDir . '/' . $fileName;
        $rawImagePath = $rawFaceswapsDir . '/' . $rawFileName;

        $finalImage = imagecreatefromstring($imageContents);
        if (!$finalImage) throw new \Exception('Failed to create image from contents.');

//        $maxWidth = 1024;
//        $width = imagesx($finalImage);
//        $height = imagesy($finalImage);
//
//        if ($width > $maxWidth) {
//            $ratio = $maxWidth / $width;
//            $newWidth = $maxWidth;
//            $newHeight = intval($height * $ratio);
//
//            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
//            imagecopyresampled($resizedImage, $finalImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
//            imagejpeg($resizedImage, $imagePath, 85);
//            imagejpeg($resizedImage, $rawImagePath, 85);
//            imagedestroy($resizedImage);
//        } else {
//            imagejpeg($finalImage, $imagePath, 85);
//            imagejpeg($finalImage, $rawImagePath, 85);
//        }
//
//        imagedestroy($finalImage);
        imagejpeg($finalImage, $imagePath, 85);
        imagejpeg($finalImage, $rawImagePath, 85);

        // ✅ Add stretched watermark
        $watermarkPath = public_path('watermark.png');
        if (!file_exists($watermarkPath)) {
            $this->createTransparentWatermark("FACESWAP", $watermarkPath);
        }

        $base64 = null;
        if (file_exists($watermarkPath)) {
            $baseImage = imagecreatefromjpeg($imagePath);
            $watermark = imagecreatefrompng($watermarkPath);

            if ($baseImage && $watermark) {
                imagealphablending($baseImage, true);
                imagesavealpha($baseImage, true);

                $baseWidth = imagesx($baseImage);
                $baseHeight = imagesy($baseImage);
                $wmWidth = imagesx($watermark);
                $wmHeight = imagesy($watermark);

                for ($x = 0; $x < $baseWidth; $x += $wmWidth) {
                    for ($y = 0; $y < $baseHeight; $y += $wmHeight) {
                        imagecopy($baseImage, $watermark, $x, $y, 0, 0, $wmWidth, $wmHeight);
                    }
                }

                imagejpeg($baseImage, $imagePath, 90);

                imagedestroy($baseImage);
                imagedestroy($watermark);

            }

            $finalImageContents = file_get_contents($imagePath);
            $base64 = 'data:image/jpeg;base64,' . base64_encode($finalImageContents);
        }

        return [
            url('arttransformer/' . $fileName),
            url('rawfaceswaps/' . $rawFileName),
            $base64
        ];
    }





    public function ShowImage($id)
    {
        $swap_image=ImagesSwap::where('media_id',$id)->first();
        if($swap_image){
            return view('image_preview',compact('swap_image'));
        }
    }



    public function GetImages()
    {
        try {
            $images = ImagesSwap::orderBy('id','desc')->paginate(20);
            $data = [
                'data' => $images,
                'success' => true
            ];
        }catch (\Exception $exception){
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }



public function testapi()
{
    $setting=Setting::first();
    $requestId='VCPcbiKPATiNBMHhp2k2Lv';
    $resultResponse = Http::withHeaders([
        'accept' => 'application/json',
        'x-magicapi-key' => $setting->magic_api_key,
        'Content-Type' => 'application/json',
    ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/result', [
        'request_id' => $requestId
    ]);
    dd($resultResponse->json());
}

public function ShowOrderRelatedImage($order_id,$line_item)
{
    $line_item=Lineitem::where('shopify_order_id',$order_id)->where('line_item_index',$line_item)->first();
    if($line_item){
        $swap_image=ImagesSwap::where('media_id',$line_item->media_id)->first();
        if($swap_image) {

            $html= view('image_preview')->with([
                'swap_image' => $swap_image,
            ])->render();

        }else{
            $html= [
                'success' => false,
                'message' => 'Record not found.'
            ];

        }
    }else{
        $html= [
            'success' => false,
            'message' => 'Record not found.'
        ];
    }
    return response($html)->withHeaders(['Content-Type' => 'application/liquid']);
    }
public function ShowOrderRelatedImageWithMediaId($media_id)
{
        $swap_image=ImagesSwap::where('media_id',$media_id)->first();
        if($swap_image) {

            if($swap_image->upscale_image==null){
                $line_item=Lineitem::where('media_id',$media_id)->first();
                if($line_item){
                $order_controller=new OrderController();
                $upscaledImageUrl = $order_controller->UpscaleImage($swap_image->swapped_image_without_water_mark);
                if ($upscaledImageUrl) {

                    $savedImagePath = $order_controller->saveUpscaledImage($upscaledImageUrl);


                    if ($savedImagePath) {
                        $swap_image->upscale_image = $savedImagePath;
                        $swap_image->save();

                        $swap_image=ImagesSwap::where('media_id',$media_id)->first();
                    }
                    }
                    }else{
                    $html= view('not_found')->render();
                    return response($html)->withHeaders(['Content-Type' => 'application/liquid']);
                }
            }

            $html= view('image_preview')->with([
                'swap_image' => $swap_image,
            ])->render();

        }else{
            $html= view('not_found')->render();

        }

    return response($html)->withHeaders(['Content-Type' => 'application/liquid']);
    }


    public function showImgMedia($media_id)
    {
        $swap_image=ImagesSwap::where('media_id',$media_id)->first();
        if($swap_image) {

            $html= view('preview')->with([
                'swap_image' => $swap_image,
            ])->render();
            return response($html)->withHeaders(['Content-Type' => 'application/liquid']);
        }

    }

    public function downloadImage(Request $request)
    {
        $url = $request->query('url');

        if (!$url) {
            return response('Invalid URL', 400);
        }

        $fileName = basename(parse_url($url, PHP_URL_PATH));

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0'
            ])->get($url);

            if ($response->ok()) {
                return response($response->body())
                    ->header('Content-Type', $response->header('Content-Type', 'application/octet-stream'))
                    ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"');
            } else {
                return response('Failed to download image: HTTP Error', 404);
            }
        } catch (\Exception $e) {
            return response('Error downloading image: ' . $e->getMessage(), 500);
        }
    }

}
