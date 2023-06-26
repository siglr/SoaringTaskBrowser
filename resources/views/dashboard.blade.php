@extends('layout')

@section('content')
    <div class="flex items-center justify-center h-screen bg-blue-100">
        <div class="p-6 bg-white rounded-lg shadow-lg w-5/6 h-5/6">
            <h1 class="text-lg font-bold text-blue-900">Dashboard</h1>

            <p class="mt-4">Welcome to the Dashboard!</p>

            <div class="mt-6">
                <a href="/tasks/upload" class="bg-blue-500 p-2 rounded-md text-blue-50 mr-4 hover:opacity-90 duration-150 ease-in-out">Upload a task</a>
                <a href="#" class="bg-blue-500 p-2 rounded-md text-blue-50 mr-4 hover:opacity-90 duration-150 ease-in-out">Edit a task</a>
                <a href="#" class="bg-blue-500 p-2 rounded-md text-blue-50 mr-4 hover:opacity-90 duration-150 ease-in-out">Account settings</a>
                <a href="/dashboard/logout" class="bg-red-500 p-2 rounded-md text-blue-50 mr-4 hover:opacity-90 duration-150 ease-in-out">Log out</a>
            </div>
            <div class="mt-6">
                <hr> 
            </div>
        </div>
    </div>
@endsection