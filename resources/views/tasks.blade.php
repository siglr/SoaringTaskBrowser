@extends('layout')

@section('content')
    <div class="flex justify-center h-screen bg-blue-100 w-full">
        <div class="my-8 p-6 bg-slate-50 rounded-lg shadow-lg w-2/3">
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-blue-900">Soaring Tasks</h1>
            </div>
        

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {{-- Maybe whe can add an background image in the future? --}}
                {{-- Task card --}}
                {{-- @dd($tasks) --}}
                @foreach ($tasks as $task)
                
                    <div class="bg-white rounded-lg shadow-lg p-6">
                    <h2 class="text-2xl font-bold mb-2"><a href="/task/{{$task->id}}">{{$task->title}}</a></h2>
                    <p class="text-gray-600 mb-4">Created by {{$task->creator}} & submitted by {{$task->submitter}}</p>
                    <div class="flex items-center justify-between text-gray-600">
                        <div class="flex items-center space-x-4">
                            <span>{{$task->total_distance}} km</span>
                            <span>&bull;</span>
                            <span>{{$task->likes}}<span class="text-red-500">♥</span></span>
                            <span>&bull;</span>
                            <span>{{$task->difficulty}}</span>
                        </div>
                        <a href="#" class="text-blue-500 hover:text-blue-700">Details</a>
                    </div>
                </div>
                
                @endforeach
                
                
                
                

            </div>
        </div>
    </div>
@endsection
