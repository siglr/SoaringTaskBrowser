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
    {{-- The navbar --}}
    <div class="w-full h-12 bg-blue-600 my-auto px-2 flex items-center">
        <h1 class="text-xl font-bold text-white"><a href="/" class="hover:text-blue-200">SoaringTaskBrowser</a></h1>

        <div class="ml-auto flex items-center">
            <a href="/tasks" class="mr-4 text-white hover:text-blue-200">Tasks</a>
            <div class="border-r border-blue-200 h-4"></div>
            {{--Using the @guest tag to check if a user is not logged in and then displaying login and signup. Otherwise showing the dashboard button--}}
            @guest
            <a href="/login" class="ml-4 text-white hover:text-blue-200">Login</a>
            <a href="/signup" class="ml-4 text-white hover:text-blue-200">Signup</a>
                
            @else
            <a href="/dashboard" class="ml-4 text-white hover:text-blue-200">Dashboard</a>
            @endguest 

           
        </div>
    </div>


    {{-- The content of the page --}}
    <div class=" min-h-screen">
        @yield('content')
    </div>
    
</body>
</html>
