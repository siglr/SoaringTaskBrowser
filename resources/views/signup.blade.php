@extends('layout')


@section('content')
    <div class="flex items-center justify-center h-screen bg-blue-100">
        <div class="p-6 bg-white rounded-lg shadow-lg w-2/6">
            <h1 class="text-lg font-bold text-blue-900">Signup</h1>

            <form action="/signup/signup" class="mt-6" method="POST">
                @csrf
                <div class="mb-4">
                    <label for="email" class="block mb-2">Email:</label>
                    <input type="email" name="email" id="email" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                </div>

                <div class="mb-4">
                    <label for="password" class="block mb-2">Password:</label>
                    <input type="password" name="password" id="password" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                </div>

                <div class="mb-4">
                    <label for="password_confirmation" class="block mb-2">Confirm password:</label>
                    <input type="password" name="password_confirmation" id="password_confirmation" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                </div>

                <button type="submit" class="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600">
                    Sign up
                </button>

                @error('email')
                    <p class="text-red-500 font-semibold">Email invalid, or missing.</p>
                @enderror
                @error('password')
                    <p class="text-red-500 font-semibold">Password invalid, or missing.</p>
                @enderror

                @if (session('status'))
                    {{session('status')}}
                @endif
            </form>
        </div>
    </div>
@endsection