<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>SoaringTaskBrowser</title>
    @vite('resources/css/app.css')
</head>
<body>
    {{-- The navbar--}}
    <div class="w-full h-8 bg-sky-700 my-auto pl-2">
        <h1 class="text-xl font-bold text-sky-50">SoaringTaskBrowser</h1>
    </div>


    {{-- The content of the page--}}
    <div>
        @yield('content')
    </div>
    
</body>
</html>