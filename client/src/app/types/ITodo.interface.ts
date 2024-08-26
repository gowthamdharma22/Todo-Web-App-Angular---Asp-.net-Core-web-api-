export interface ITodoData {
  id: string;
  text: string;
  completed: boolean;
  isEditing: boolean;
  editText: string;
}

export interface ITodoDbData {
  id: string;
  description: string;
  isCompleted: boolean;
  userId: string;
}
