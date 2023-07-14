<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\IndexController;
use App\Http\Controllers\DashController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DownloadController;

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

//All the routes for tasks
Route::get('/tasks', [TaskController::class, 'view']);

route::get('/task/{id}', [TaskController::class, 'task']);

route::get('/dashboard', [DashController::class, 'view'] )->middleware('auth');

route::get('/tasks/upload', [TaskController::class, 'uploadview'])->middleware('auth');

route::post('/tasks/uploadtask', [TaskController::class, 'uploadTask'])->middleware('auth');

//The routes for handling authentication
route::get('/login', [AuthController::class, 'login'])->name('login');
route::post('/login/login', [AuthController::class, 'Authenticate']);

route::get('/signup', [AuthController::class, 'signup'])->name('signup');
route::post('/signup/signup', [AuthController::class, 'newuser']);

route::get('/dashboard/logout', [AuthController::class, 'logout'])->middleware('auth');

//Routes for handling downloads

Route::get('/task/download/dphx/{id}', [DownloadController::class, 'dphx']);
Route::get('/task/download/pln/{id}', [DownloadController::class, 'pln']);
Route::get('/task/download/wpr/{id}', [DownloadController::class, 'wpr']);
Route::get('/task/download/tsk/{id}', [DownloadController::class, 'tsk']);