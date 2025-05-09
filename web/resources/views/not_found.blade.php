<!-- resources/views/errors/404.blade.php -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>404 Page Not Found</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --color-foreground-secondary: 72, 85, 99; /* fallback gray tone */
            --font-body-scale: 1; /* set to 1 unless overridden elsewhere */
        }
        .font-fraunces {
            font-family: 'Fraunces', serif;
        }
        .font-inter {
            font-family: 'Inter', sans-serif;
        }
        .custom-paragraph {
            margin-top: 0;
            margin-bottom: 2.4rem;
            margin-inline: auto;
            max-width: 46rem;
            color: rgb(var(--color-foreground-secondary));
            text-align: center;
            font-size: calc(var(--font-body-scale) * 1.5rem);
        }
    </style>
</head>
<body class="bg-[#f5f4eb] flex items-center justify-center min-h-screen">
<div class="text-center px-4">
    <h1 class="text-4xl font-fraunces text-[#2c3e50] mb-4">404. Page Not Found</h1>
    <p class="font-inter custom-paragraph">
        The page you were looking for could not be found. It might have been removed, renamed, or did not exist in the first place. Perhaps searching can help.
    </p>
</div>
</body>
</html>
