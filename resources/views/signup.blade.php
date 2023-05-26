@extends('layout')

@section('content')
    <div class="p-5">
        <h1 class="font-bold text-lg">Signup</h1>

        <form action="/signup/signup" class="">
        <label for="name" class="py-5">Name: <input type="text" name="name" id="name" class="border-2 border-blue-950 rounded px-1"></label> <br>
        <label for="email" class="py-5">Email: <input type="email" name="Email" id="Email" class="border-2 border-blue-950 rounded px-1"></label> <br>
        </form>
    </div>
@endsection