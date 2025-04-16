<?php

namespace App\Http\Controllers;

use App\Models\ImagesSwap;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

use Illuminate\Support\Str;

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
//    public function SwapImage(Request $request)
//    {
//        try {
//            $setting=Setting::first();
//            $swapImage = $request->file('swap_image');
//
//            if (!$swapImage || !$swapImage->isValid()) {
//                return response()->json([
//                    'success' => false,
//                    'error' => 'Uploaded swap image is invalid.',
//                ]);
//            }
//
//            // Step 1: Save the uploaded image to originalpic directory
//            $swapFileName = 'swap_' . Str::uuid() . '.' . $swapImage->getClientOriginalExtension();
//            $originalDir = public_path('originalpic');
//
//            if (!file_exists($originalDir)) {
//                mkdir($originalDir, 0777, true);
//            }
//
//            $swapImage->move($originalDir, $swapFileName);
//            $swapImageUrl = url('originalpic/' . $swapFileName);
//
//            // Step 2: Call MagicAPI for face swapping
//
//
//            if($setting->type=='magic_api') {
//                $response = Http::withHeaders([
//                    'accept' => 'application/json',
//                    'x-magicapi-key' => env('FACE_SWAP_API'),
//                    'Content-Type' => 'application/json',
//                ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/faceswap-image', [
//                    'input' => [
//                        'swap_image' => $swapImageUrl,
//                        'target_image' => $request->target_image,
//                    ]
//                ]);
//
//                $data = $response->json();
//                $requestId = $data['request_id'] ?? null;
//
//                if (!$requestId) {
//                    return response()->json([
//                        'success' => false,
//                        'error' => 'Request ID not received.'
//                    ]);
//                }
//
//                // Step 3: Wait and fetch result
//                sleep(3);
//
//                $resultResponse = Http::withHeaders([
//                    'accept' => 'application/json',
//                    'x-magicapi-key' => env('FACE_SWAP_API'),
//                    'Content-Type' => 'application/json',
//                ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/result', [
//                    'request_id' => $requestId
//                ]);
//
//                $resultData = $resultResponse->json();
//                $outputImageUrl = $resultData['output'] ?? null;
//
//                if (!$outputImageUrl) {
//                    return response()->json([
//                        'success' => false,
//                        'error' => 'Output image not found.'
//                    ]);
//                }
//
//                // Step 4: Save the result image to faceswaps
//                $imageContents = file_get_contents($outputImageUrl);
//                if (!$imageContents) {
//                    return response()->json([
//                        'success' => false,
//                        'error' => 'Failed to download the output image.'
//                    ]);
//                }
//
//                $faceswapsDir = public_path('faceswaps');
//                if (!file_exists($faceswapsDir)) {
//                    mkdir($faceswapsDir, 0777, true);
//                }
//
//                $fileName = 'faceswap_' . Str::uuid() . '.jpg';
//                $imagePath = $faceswapsDir . '/' . $fileName;
//                file_put_contents($imagePath, $imageContents);
//
//                // Step 5: Add watermark (if it exists or create one)
//                $watermarkPath = public_path('watermark.png');
//                if (!file_exists($watermarkPath)) {
//                    $this->createTransparentWatermark("FACESWAP", $watermarkPath);
//                }
//
//                if (file_exists($watermarkPath)) {
//                    $baseImage = imagecreatefromjpeg($imagePath);
//                    $watermark = imagecreatefrompng($watermarkPath);
//
//                    if ($baseImage && $watermark) {
//                        imagealphablending($baseImage, true);
//                        imagealphablending($watermark, true);
//                        imagesavealpha($watermark, true);
//
//                        $baseWidth = imagesx($baseImage);
//                        $baseHeight = imagesy($baseImage);
//                        $wmWidth = imagesx($watermark);
//                        $wmHeight = imagesy($watermark);
//
//                        $destX = $baseWidth - $wmWidth - 20;
//                        $destY = $baseHeight - $wmHeight - 20;
//
//                        imagecopy($baseImage, $watermark, $destX, $destY, 0, 0, $wmWidth, $wmHeight);
//                        imagejpeg($baseImage, $imagePath, 95);
//
//                        imagedestroy($baseImage);
//                        imagedestroy($watermark);
//                    } else {
//                        return response()->json([
//                            'success' => false,
//                            'error' => 'Failed to create image resources for watermarking.'
//                        ]);
//                    }
//                }
//            }elseif ($setting->type=='deepfaceswap'){
//                $response = Http::withHeaders([
//                    'Authorization' => 'Bearer ' . env('DEEPFACESWAP_API_TOKEN'),
//                ])
//                    ->attach(
//                        'swap[source_resource][file]',
//                        file_get_contents($swapImageUrl),
//                        'source.jpg'
//                    )
//                    ->attach(
//                        'swap[target_resource][file]',
//                        file_get_contents($request->target_image),
//                        'target.jpg'
//                    )
//                    ->post('https://deepfaceswap.ai/api/v1/swaps');
//                if (!$response->successful()) {
//                    return response()->json([
//                        'success' => 'false',
//                        'error' => $response->body(),
//                    ], $response->status());
//                }
//                $data = $response->json();
//                $swapId = $data['id'];
//
//                // Start polling until status is "completed" or max attempts reached
//                $maxAttempts = 10;
//                $attempt = 0;
//                $delay = 10; // seconds
//
//                do {
//                    sleep($delay);
//                    $attempt++;
//
//                    $statusResponse = Http::withHeaders([
//                        'Authorization' => 'Bearer ' . env('DEEPFACESWAP_API_TOKEN'),
//                    ])->get("https://deepfaceswap.ai/api/v1/swaps/{$swapId}");
//
//                    if (!$statusResponse->successful()) {
//                        return response()->json([
//                            'success' => 'false',
//                            'error' => $statusResponse->body(),
//                        ], $statusResponse->status());
//                    }
//
//                    $statusData = $statusResponse->json();
//                } while ($statusData['status'] !== 'completed' && $attempt < $maxAttempts);
//            }
//            // Step 6: Return the final image URL
//            return response()->json([
//                'success' => true,
//                'url' => url('faceswaps/' . $fileName),
//            ]);
//
//        } catch (\Exception $exception) {
//            return response()->json([
//                'error' => $exception->getMessage(),
//                'success' => false
//            ]);
//        }
//    }


    public function SwapImage(Request $request)
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

                sleep(3);
                $resultResponse = Http::withHeaders([
                    'accept' => 'application/json',
                    'x-magicapi-key' => $setting->magic_api_key,
                    'Content-Type' => 'application/json',
                ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/result', [
                    'request_id' => $requestId
                ]);

                $finalImageUrl = $resultResponse->json()['output'] ?? null;
                if (!$finalImageUrl) throw new \Exception('Output image not found from MagicAPI');
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

            $faceswapsDir = public_path('faceswaps');
            if (!file_exists($faceswapsDir)) mkdir($faceswapsDir, 0777, true);

            $fileName = 'faceswap_' . Str::uuid() . '.jpg';
            $imagePath = $faceswapsDir . '/' . $fileName;

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
                imagedestroy($resizedImage);
            } else {
                imagejpeg($finalImage, $imagePath, 85);
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
                'original_image' => url('originalpic/' . $swapFileName),
                'swapped_image' => url('faceswaps/' . $fileName),
                'type' => $setting->type,

            ]);

            // ------------------- RETURN FINAL URL -------------------
            return response()->json([
                'success' => true,
                'url' => url('faceswaps/' . $fileName),
            ]);

        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'error' => $exception->getMessage(),
            ]);
        }
    }





}
