<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title', 250)->nullable();
            $table->string('creator', 30)->nullable()->default('Joe Johnson');
            $table->string('submitter', 30)->nullable()->default('Spongebob');
            $table->float('task_distance')->nullable();
            $table->float('total_distance')->nullable();
            $table->float('min_time')->nullable();
            $table->float('max_time')->nullable();
            $table->string('difficulty', 50)->nullable();
            $table->float('likes')->nullable();
            $table->text('desc')->nullable();
            $table->enum('type', ['ridge', 'thermal', 'ridge & thermal'])->nullable();
            $table->string('glider_type', 80)->nullable()->default('any');
            $table->string('poi', 50)->nullable()->default('The world');

            $table->string('departure', 30)->nullable();
            $table->string('arrival', 30)->nullable();

            $table->string('date', 50)->nullable();

            $table->string('dphx_name', 200)->nullable();
            $table->string('wpr_name', 200)->nullable();
            $table->string('pln_name', 200)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
