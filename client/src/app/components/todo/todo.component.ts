import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { TodoService } from '../../service/todo-service/todo.service';
import { ITodoData } from '../../types/ITodo.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
})
export class TodoComponent implements OnInit {
  todoService = inject(TodoService);
  todoText: string = '';
  private activatedRoute = inject(ActivatedRoute);

  get todoList(): ITodoData[] {
    return this.todoService.todosSignal();
  }

  ngOnInit(): void {
    const initialTodos = this.activatedRoute.snapshot.data['todos'];
    this.todoService.todosSignal.set(initialTodos);
  }

  onSubmit() {
    try {
      this.todoService.addTodo(this.todoText);
      this.todoText = '';
    } catch (error: any) {
      console.log(error);
    }
  }

  deleteTodo(id: string) {
    this.todoService.deleteTodo(id);
  }

  toggleCompleted(index: string) {
    this.todoService.toggleCompleted(index);
  }

  editTodo(index: string) {
    this.todoService.editTodo(index);
  }

  saveEdit(id: string) {
    const todo = this.todoList.find((todo) => todo.id === id);
    try {
      this.todoService.saveEdit(id, todo!.editText);
    } catch (error: any) {
      console.log(error);
    }
  }

  cancelEdit(index: string) {
    this.todoService.cancelEdit(index);
  }
}
