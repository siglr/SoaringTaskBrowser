@extends('layout')

@section('content')
    <div>
        <div class="flex justify-center h-screen bg-blue-100 w-full">
            <div class="my-8 p-6 bg-slate-50 rounded-lg shadow-lg w-2/3">
                <div class="mb-6">
                    <h1 class="text-2xl font-bold text-blue-900">{{$task->title}}</h1>
                    <p class="italic ">Made by <strong>{{$task->creator}}</strong> and submitted by <strong>{{$task->submitter}}</strong></p>
                </div>

                <div class="p-8">
                    <h2 class="text-blue-900 text-lg font-bold">Description</h2>
                    <p>{{$task->desc}}</p>
                </div>

                <div class="pt-6 px-8">
                    <h2 class="text-blue-900 text-lg font-bold">Information</h2>

                    <table class="auto p-2">
                        <tbody>
                            <tr>
                                <td>Total Distance</td>
                                <td>{{$task->total_distance}} km</td>
                            </tr>
                            <tr>
                                <td>Task Distance</td>
                                <td>{{$task->task_distance}} km</td>
                            </tr>
                            <tr>
                                <td>Duration</td>
                                <td>{{$task->min_time}} to {{$task->max_time}} min</td>
                            </tr>
                            <tr>
                                <td>Difficulty</td>
                                <td>{{$task->difficulty}}</td>
                            </tr>
                            <tr>
                                <td>Type</td>
                                <td>{{$task->type}}</td>
                            </tr>
                            <tr>
                                <td>Glider Type</td>
                                <td>{{$task->glider_type}}</td>
                            </tr>
                            <tr>
                                <td>POI</td>
                                <td>{{$task->poi}}</td>
                            </tr>
                            <tr>
                                <td>Departure</td>
                                <td>{{$task->departure}}</td>
                            </tr>
                            <tr>
                                <td>Arrival</td>
                                <td>{{$task->arrival}}</td>
                            </tr>
                            <tr>
                                <td>Sim Date</td> 
                                <td>{{$task->date}}</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
    </div>
@endsection