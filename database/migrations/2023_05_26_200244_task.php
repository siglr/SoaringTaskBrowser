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
            $table->string('author', 30)->nullable()->default('Joe Johnson');
            $table->float('length')->nullable();
            $table->string('difficulty', 50)->nullable();
            $table->float('likes')->nullable();
            $table->text('desc')->nullable();

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
