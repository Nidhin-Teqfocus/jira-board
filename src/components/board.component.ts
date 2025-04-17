import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { v4 as uuid } from 'uuid';

interface Issue {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

interface Column {
  id: string;
  title: string;
  issues: Issue[];
  createdAt: number;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  columns: Column[] = [];

  get connectedDropListsIds(): string[] {
    return this.columns.map(c => c.id);
  }

  ngOnInit() {
    const saved = localStorage.getItem('boardData');
    if (saved) {
      this.columns = JSON.parse(saved);
      this.columns.forEach(column => {
        this.sortIssues(column.id);  // Sort issues when loading data
      });
    }
  }

  save() {
    localStorage.setItem('boardData', JSON.stringify(this.columns));
  }

  addColumn() {
    const title = prompt('Column name:');
    if (title) {
      const newColumn: Column = {
        id: uuid(),
        title,
        issues: [],
        createdAt: Date.now()
      };
      this.columns.push(newColumn);
      this.save();
    }
  }

  deleteColumn(id: string) {
    this.columns = this.columns.filter(c => c.id !== id);
    this.save();
  }

  addIssue(columnId: string) {
    const title = prompt('Issue title:');
    const description = prompt('Issue description:');
    if (title && description !== null) {
      const column = this.columns.find(c => c.id === columnId);
      if (column) {
        column.issues.unshift({
          id: uuid(),
          title,
          description,
          createdAt: Date.now()
        });
        this.sortIssues(columnId);  // Sort issues after adding
        this.save();
      }
    }
  }

  deleteIssue(columnId: string, issueId: string) {
    const column = this.columns.find(c => c.id === columnId);
    if (column) {
      column.issues = column.issues.filter(i => i.id !== issueId);
      this.sortIssues(columnId);  // Sort issues after deletion
      this.save();
    }
  }

  drop(event: CdkDragDrop<Issue[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.sortIssues(event.container.id);  // Use the ID of the target container to sort its issues
    this.save();
  }

  // Method to sort issues inside a column by 'createdAt' (reverse chronological)
  sortIssues(columnId: string) {
    const column = this.columns.find(c => c.id === columnId);
    if (column) {
      column.issues.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

}
