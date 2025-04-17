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
    }
  }

  save() {
    localStorage.setItem('boardData', JSON.stringify(this.columns));
  }

  addColumn() {
    const title = prompt('Column name:');
    if (title) {
      this.columns.push({ id: uuid(), title, issues: [] });
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
      const col = this.columns.find(c => c.id === columnId);
      col?.issues.unshift({
        id: uuid(),
        title,
        description,
        createdAt: Date.now()
      });
      this.save();
    }
  }

  deleteIssue(columnId: string, issueId: string) {
    const col = this.columns.find(c => c.id === columnId);
    if (col) {
      col.issues = col.issues.filter(i => i.id !== issueId);
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
    this.save();
  }
}
