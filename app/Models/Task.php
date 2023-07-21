<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class task extends Model
{
    use HasFactory;

    public static function tasks() {
        $tasks = [];

        // //retrieve all the data
        $tasks = DB::table('tasks')->select('id', 'title', 'creator', 'submitter', 'total_distance', 'likes', 'difficulty')->get();

        foreach ($tasks as $task) {
            $difficulty = $task->difficulty;
            //Check the value of $difficulty and give it an fitting star
            switch ($difficulty) {
                case '1. Beginner':
                    $newDifficulty = "★☆☆☆☆";
                    break;
                
                case '2. Student':
                    $newDifficulty = "★★☆☆☆";
                    break;

                case '3. Experimented':
                    $newDifficulty = "★★★☆☆";
                    break;

                case '4. Professional':
                    $newDifficulty = "★★★★☆";
                    break;

                case '1. Champion':
                    $newDifficulty = "★★★★★";
                    break;

                default:
                    $newDifficulty = $difficulty;
                    break;

                
            }
            $task->difficulty = $newDifficulty;
        }
        
        return $tasks;
    }

    public static function mytasks() {
        $owner_id = Auth::id();
        
        $tasks = DB::table('tasks')->where('owner_id', $owner_id)->get();

        return $tasks;
    }

    public static function Authorize($id) {
        $task_id = $id;
        $user_id = Auth::id();
        $owner_id = DB::table('tasks')->where('id', $task_id)->value('owner_id');

        if($owner_id == $user_id) {
            $task = task::findOrFail($task_id);
            return $task;
        } else {
            abort(403);
        }
    }
}
