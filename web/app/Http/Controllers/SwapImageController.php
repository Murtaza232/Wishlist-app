<?php

namespace App\Http\Controllers;

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
    public function SwapImage(Request $request)
    {
        try {
            $swapImage = $request->file('swap_image');

            if (!$swapImage || !$swapImage->isValid()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Uploaded swap image is invalid.',
                ]);
            }

            // Step 1: Save swap image locally and get its URL
            $swapFileName = 'swap_' . Str::uuid() . '.' . $swapImage->getClientOriginalExtension();
            $swapDir = public_path('faceswaps');
            if (!file_exists($swapDir)) {
                mkdir($swapDir, 0777, true);
            }

            $swapImage->move($swapDir, $swapFileName);
            $swapImageUrl = url('faceswaps/' . $swapFileName);


            // Step 2: Call MagicAPI for face swapping
            $response = Http::withHeaders([
                'accept' => 'application/json',
                'x-magicapi-key' => env('FACE_SWAP_API'),
                'Content-Type' => 'application/json',
            ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/faceswap-image', [
                'input' => [
                    'swap_image' => $swapImageUrl,
                    'target_image' => $request->target_image,
                ]
            ]);

            $data = $response->json();
            $requestId = $data['request_id'] ?? null;

            if (!$requestId) {
                return response()->json([
                    'success' => false,
                    'error' => 'Request ID not received.'
                ]);
            }

            // Step 3: Wait and fetch result
            sleep(3); // Give time for processing

            $resultResponse = Http::withHeaders([
                'accept' => 'application/json',
                'x-magicapi-key' => env('FACE_SWAP_API'),
                'Content-Type' => 'application/json',
            ])->post('https://api.magicapi.dev/api/v1/magicapi/faceswap/result', [
                'request_id' => $requestId
            ]);

            $resultData = $resultResponse->json();
            $outputImageUrl = $resultData['output'] ?? null;

            if (!$outputImageUrl) {
                return response()->json([
                    'success' => false,
                    'error' => 'Output image not found.'
                ]);
            }

            // Step 4: Download and save the result image
            $imageContents = file_get_contents($outputImageUrl);
            if (!$imageContents) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to download the output image.'
                ]);
            }

            $fileName = 'faceswap_' . Str::uuid() . '.jpg';
            $imagePath = $swapDir . '/' . $fileName;
            file_put_contents($imagePath, $imageContents);

            // Step 5: Add watermark (if it exists or create one)
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
                    imagejpeg($baseImage, $imagePath, 95);

                    imagedestroy($baseImage);
                    imagedestroy($watermark);
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => 'Failed to create image resources for watermarking.'
                    ]);
                }
            }

            // Step 6: Return the final image URL
            return response()->json([
                'success' => true,
                'url' => url('faceswaps/' . $fileName),
            ]);

        } catch (\Exception $exception) {

            return response()->json([
                'error' => $exception->getMessage(),
                'success' => false
            ]);
        }
    }
}
