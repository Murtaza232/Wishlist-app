<div class="container" style="position: relative; padding-top: 8rem; padding-bottom: 8rem;">

    <!-- Top-right download button -->
    <div style="position: absolute; top: 0; right: 0; padding: 1rem;">
        <button onclick="window.location.href='{{ route('download.image', ['url' => $swap_image->upscale_image]) }}'"
                style="background-color: black; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            Download
        </button>
    </div>

    <!-- Centered image -->
    <div style="text-align: center;">
        <img src="{{ $swap_image->upscale_image }}" alt="Preview" style="max-width: 100%; height: auto;" />
    </div>
</div>
