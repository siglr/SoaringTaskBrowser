@extends('layout')

@section('content')
    <div>
        <div class="flex justify-center h-fit bg-blue-100 w-full">
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
                                <td class="pl-2 font-bold">{{$task->total_distance}} km</td>
                            </tr>
                            <tr>
                                <td>Task Distance</td>
                                <td class="pl-2 font-bold">{{$task->task_distance}} km</td>
                            </tr>
                            <tr>
                                <td>Duration</td>
                                <td class="pl-2 font-bold">{{$task->min_time}} to {{$task->max_time}} min</td>
                            </tr>
                            <tr>
                                <td>Difficulty</td>
                                <td class="pl-2 font-bold">{{$task->difficulty}}</td>
                            </tr>
                            <tr>
                                <td>Type</td>
                                <td class="pl-2 font-bold">{{$task->type}}</td>
                            </tr>
                            <tr>
                                <td>Glider Type</td>
                                <td class="pl-2 font-bold">{{$task->glider_type}}</td>
                            </tr>
                            <tr>
                                <td>POI</td>
                                <td class="pl-2 font-bold">{{$task->poi}}</td>
                            </tr>
                            <tr>
                                <td>Departure</td>
                                <td class="pl-2 font-bold">{{$task->departure}}</td>
                            </tr>
                            <tr>
                                <td>Arrival</td>
                                <td class="pl-2 font-bold">{{$task->arrival}}</td>
                            </tr>
                            <tr>
                                <td>Sim Date</td> 
                                <td class="pl-2 font-bold">{{$task->date}}</td>
                            </tr>
                        </tbody>
                    </table>

                </div>

                <div class="pt-6 px-8">
                    <h2 class="text-blue-900 text-lg font-bold">Downloads</h2>

                    <h3 class="text-blue-900 text-md font-bold pt-2">DPHX</h3>
                     <a href="download/dphx/{{$task->id}}" class="text-blue-600 hover:text-blue-300">{{$task->dphx_name}}</a>

                     <h3 class="text-blue-900 text-md font-bold pt-2">Other</h3>
                     <a href="download/pln/{{$task->id}}" class="text-blue-600 hover:text-blue-300">{{$task->pln_name}}</a> <br>
                     <a href="download/wpr/{{$task->id}}" class="text-blue-600 hover:text-blue-300">{{$task->wpr_name}}</a> <br>
                     <a href="download/tsk/{{$task->id}}" class="text-blue-600 hover:text-blue-300">{{$task->tsk_name}}</a>
                </div>
    </div>
@endsection