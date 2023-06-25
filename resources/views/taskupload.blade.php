@extends('layout')

@section('content')
    <div class="flex items-center justify-center h-fit bg-blue-100">
        <div class="p-6 bg-white rounded-lg shadow-lg w-5/6 my-8">
            <h1 class="text-lg font-bold text-blue-900">Upload Soaring Task</h1>

            <div class="mt-6">
                <form action="/tasks/uploadtask" method="POST" enctype="multipart/form-data">
                    @csrf

                    <div class="mb-4">
                        <label for="dphx_file" class="block mb-2">DPHX File:</label>
                        <input type="file" name="dphx_file" id="dphx_file" class="w-full">
                    </div>

                    <div class="mb-4">
                        <label for="submitter" class="block mb-2">Submitted by:</label>
                        <input type="text" name="submitter" id="submitter" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <div class="mb-4">
                        <label for="creator" class="block mb-2">Created by:</label>
                        <input type="text" name="creator" id="creator" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <div class="flex mb-4">
                        <div class="w-1/2 pr-2">
                            <label for="task_distance" class="block mb-2">Task Distance (km):</label>
                            <input type="text" name="task_distance" id="task_distance" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                        </div>

                        <div class="w-1/2 pl-2">
                            <label for="total_distance" class="block mb-2">Total Distance (km):</label>
                            <input type="text" name="total_distance" id="total_distance" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                        </div>
                    </div>

                    <input type="submit" value="Upload" class="bg-blue-500 px-4 py-2 text-blue-50 rounded hover:opacity-90 duration-150 ease-in-out">
                
                    @error('dphx_file')
                    <p class="text-red-500 font-semibold">No file uploaded.</p>   
                    @enderror 

                    @error('submitted')
                    <p class="text-red-500 font-semibold">Submitter input missing.</p>   
                    @enderror

                    @error('creator')
                    <p class="text-red-500 font-semibold">Creator input missing.</p>   
                    @enderror

                    @error('task_distance')
                    <p class="text-red-500 font-semibold">Task distance input missing.</p>   
                    @enderror

                    @error('total_distance')
                    <p class="text-red-500 font-semibold">Total distance input missing.</p>   
                    @enderror

                    @error('min_time')
                    <p class="text-red-500 font-semibold">Min time input missing.</p>   
                    @enderror

                    @error('max_time')
                    <p class="text-red-500 font-semibold">Max time distance input missing.</p>   
                    @enderror


                </form>
            </div>
        </div>
    </div>
@endsection
