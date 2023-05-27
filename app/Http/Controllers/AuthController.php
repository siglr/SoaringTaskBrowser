<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login() {
        return view('login');
    }

    //Authenticate the user
    public function Authenticate(Request $request) {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if(Auth::attempt($credentials)) {
            $request->session()->regenerate();
 
            return redirect()->intended('dashboard');
        }
    }

    public function signup() {
        return view('signup');
    }

    //Creating a new user
    public function newuser(Request $request) {
        //validate the form
        $credentials = $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'email' => $request->input('email'),
            'password' => hash::make($request->input('password'))
        ]);

        return redirect()->back()->with('status', 'Account created! You can now try to log in to your account.');

    }

    public function logout(Request $request) {
        Auth::logout();
 
        $request->session()->invalidate();

        return redirect('/');
    }
}
