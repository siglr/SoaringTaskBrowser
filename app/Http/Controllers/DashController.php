<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashController extends Controller
{
    public function view() {
        if(Auth::check) {
            return view('dashboard');
        }
       
    }

    public function login() {

    }
}
