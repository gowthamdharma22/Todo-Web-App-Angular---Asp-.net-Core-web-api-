import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { TodoService } from '../service/todo-service/todo.service';
import { ITodoData, ITodoDbData } from '../types/ITodo.interface';

@Injectable({
  providedIn: 'root',
})
export class TodoResolver implements Resolve<ITodoData[]> {
  constructor(private todoService: TodoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ITodoData[]> {
    return this.todoService.fetchTodos();
  }
}
