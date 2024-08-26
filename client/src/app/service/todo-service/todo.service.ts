import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ITodoData, ITodoDbData } from '../../types/ITodo.interface';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoService implements OnDestroy {
  private todos = signal<ITodoData[]>([]);
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchTodos(): Observable<ITodoData[]> {
    return this.http.get<ITodoDbData[]>('todo').pipe(
      map((todos) =>
        todos.map((todo) => ({
          id: todo.id,
          text: todo.description,
          completed: todo.isCompleted,
          isEditing: false,
          editText: todo.description,
        }))
      ),
      tap((formattedTodos) => {
        this.todos.set(formattedTodos);
      }),
      takeUntil(this.destroy$)
    );
  }

  get todosSignal() {
    return this.todos;
  }

  addTodo(todoText: string) {
    if (!todoText.trim()) {
      this.toastr.warning('Please Enter a Value');
      throw new Error('Please Enter a Value');
    }

    if (this.todos().some((todo) => todo.text === todoText)) {
      this.toastr.warning(`"${todoText}" Already Exists in the List`);
      throw new Error(`"${todoText}" Already Exists in the List`);
    }

    this.http
      .post<any>('todo', {
        description: todoText,
        isCompleted: false,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.toastr.success(`"${todoText}" Added Successfully`);
          this.todos.update((todos) => [
            ...todos,
            {
              id: response?.data?.id,
              text: todoText,
              completed: false,
              isEditing: false,
              editText: todoText,
            },
          ]);
        },
        error: (error) => {
          console.error('Error adding todo:', error);
          this.toastr.error('Failed to Add Todo');
        },
      });
  }

  deleteTodo(id: string) {
    this.http
      .delete('todo/' + id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const todo = this.todos().find((t) => t.id === id);
          this.toastr.success(`Todo "${todo?.text}" Deleted Successfully`);
          this.todos.update((todos) => {
            return todos.filter((t) => t.id !== id);
          });
        },
        error: (error) => {
          console.error('Error deleting todo:', error);
          this.toastr.error('Failed to Delete Todo');
        },
      });
  }
  editTodo(id: string) {
    this.todos.update((todos) => {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        todo.isEditing = true;
        todo.editText = todo.text;
      }
      return [...todos];
    });
  }

  toggleCompleted(id: string) {
    const todo = this.todos().find((t) => t.id === id);
    if (!todo) {
      this.toastr.error('Todo not found');
      return;
    }
    const updatedTodo = { isCompleted: !todo.completed };

    this.http
      .put(`todo/${id}`, updatedTodo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          updatedTodo.isCompleted
            ? this.toastr.success('Completed')
            : this.toastr.warning('Not Completed');
          this.todos.update((todos) => {
            return todos.map((t) =>
              t.id === id ? { ...t, completed: updatedTodo.isCompleted } : t
            );
          });
        },
        error: (error) => {
          console.error('Error marking todo as completed:', error);
          this.toastr.error('Failed to Mark Todo as Completed');
        },
      });
  }

  saveEdit(id: string, newText: string) {
    this.http
      .put('todo/' + id, { description: newText })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Todo updated successfully');
          newText = newText.trim();
          if (newText) {
            this.todos.update((todos) => {
              const todo = todos.find((t) => t.id === id);
              if (todo) {
                todo.text = newText;
                todo.isEditing = false;
              }
              return [...todos];
            });
          }
        },
        error: (error) => {
          console.error('Error updating todo:', error);
          this.toastr.error('Failed to Update Todo');
        },
      });
  }
  cancelEdit(id: string) {
    this.todos.update((todos) => {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        todo.isEditing = false;
        todo.text = todo.editText;
      }
      return [...todos];
    });
  }
}
