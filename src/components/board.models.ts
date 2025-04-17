// models/board.model.ts
export interface Issue {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}


export interface Column {
  id: string;
  title: string;
  issues: Issue[];
  createdAt : number;
}
