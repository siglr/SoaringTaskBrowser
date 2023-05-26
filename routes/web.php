<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\IndexController;
use App\Http\Controllers\DashController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', [IndexController::class, 'view']);

// Route::get('/tasks', []) Later for the entire tasks list

// route::get('/task/{id}') Later for single tasks. 

route::get('/dashboard', [DashController::class, 'view'] )->middleware('auth');

route::get('/login', [AuthController::class, 'login'])->name('login');

route::get('/signup', [AuthController::class, 'signup'])->name('signup');
