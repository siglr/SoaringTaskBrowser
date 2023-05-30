@extends('layout')

@section('content')
    <div class="flex items-center justify-center h-fit bg-blue-100">
        <div class="p-6 bg-white rounded-lg shadow-lg w-5/6 mt-6">
            <h1 class="text-lg font-bold text-blue-900">Upload Soaring Task</h1>

            <div class="mt-6">
                <form action="/tasks/upload" method="POST" enctype="multipart/form-data">
                    @csrf

                    <div class="mb-4">
                        <label for="dphx_file" class="block mb-2">DHPX File:</label>
                        <input type="file" name="dphx_file" id="dphx_file" class="w-full">
                    </div>

                    <div class="mb-4">
                        <label for="wpr_file" class="block mb-2">WPR File:</label>
                        <input type="file" name="wpr_file" id="wpr_file" class="w-full">
                    </div>

                    <div class="mb-4">
                        <label for="pln_file" class="block mb-2">PLN File:</label>
                        <input type="file" name="pln_file" id="pln_file" class="w-full">
                    </div>

                    <div class="mb-4">
                        <label for="submitter" class="block mb-2">Submitter:</label>
                        <input type="text" name="submitter" id="submitter" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <div class="mb-4">
                        <label for="task_distance" class="block mb-2">Task Distance:</label>
                        <input type="text" name="task_distance" id="task_distance" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <div class="mb-4">
                        <label for="total_distance" class="block mb-2">Total Distance:</label>
                        <input type="text" name="total_distance" id="total_distance" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <div class="mb-4">
                        <label for="min_time" class="block mb-2">Minimum Time:</label>
                        <input type="text" name="min_time" id="min_time" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <div class="mb-4">
                        <label for="max_time" class="block mb-2">Maximum Time:</label>
                        <input type="text" name="max_time" id="max_time" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <div class="mb-4">
                        <label for="glider_type" class="block mb-2">Recommended Gliders:</label>
                        <input type="text" name="glider_type" id="glider_type" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <div class="mb-4">
                        <label for="poi" class="block mb-2">Point of Interest:</label>
                        <input type="text" name="poi" id="poi" class="w-full px-4 py-2 border-2 border-blue-500 rounded">
                    </div>

                    <button type="submit" class="bg-blue-500 px-4 py-2 text-blue-50 rounded hover:opacity-90 duration-150 ease-in-out">
                        Upload Task
                    </button>
                </form>
            </div>
        </div>
    </div>
@endsection
