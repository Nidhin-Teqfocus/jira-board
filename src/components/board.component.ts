import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { Column, Issue } from './board.models';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule,FormsModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  columns: Column[] = [];

  get connectedDropListsIds(): string[] {
    return this.columns.map((c) => c.id);
  }

  ngOnInit() {
    const saved = localStorage.getItem('boardData');
    if (saved) {
      this.columns = JSON.parse(saved);
      this.columns.forEach((column) => {
        this.sortIssues(column.id); // Sort issues when loading data
      });
    }
  }

  save() {
    localStorage.setItem('boardData', JSON.stringify(this.columns));
  }

  newColumnTitle = '';
  addColumn() {
    const title = this.newColumnTitle.trim();
    if (title) {
      const newColumn: Column = {
        id: uuid(),
        title,
        issues: [],
        createdAt: Date.now()
      };
      this.columns.push(newColumn);
      this.newColumnTitle = '';
      this.save();
    }
  }

  deleteColumn(id: string) {
    this.columns = this.columns.filter((c) => c.id !== id);
    this.save();
  }
  showIssueForm: { [key: string]: boolean } = {};

  newIssueTitle: { [key: string]: string } = {};
  newIssueDescription: { [key: string]: string } = {};
  addIssue(columnId: string) {
    const title = this.newIssueTitle[columnId]?.trim();
    const description = this.newIssueDescription[columnId]?.trim();
    if (title && description) {
      const column = this.columns.find(c => c.id === columnId);
      if (column) {
        column.issues.unshift({
          id: uuid(),
          title,
          description,
          createdAt: Date.now()
        });
        this.sortIssues(columnId);
        this.save();

        this.newIssueTitle[columnId] = '';
        this.newIssueDescription[columnId] = '';
        this.showIssueForm[columnId] = false; // hide the form
      }
    }
  }


  deleteIssue(columnId: string, issueId: string) {
    const column = this.columns.find((c) => c.id === columnId);
    if (column) {
      column.issues = column.issues.filter((i) => i.id !== issueId);
      this.sortIssues(columnId); // Sort issues after deletion
      this.save();
    }
  }

  drop(event: CdkDragDrop<Issue[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.sortIssues(event.container.id); // Use the ID of the target container to sort its issues
    this.save();
  }

  // Method to sort issues inside a column by 'createdAt' (reverse chronological)
  sortIssues(columnId: string) {
    const column = this.columns.find((c) => c.id === columnId);
    if (column) {
      column.issues.sort((a, b) => b.createdAt - a.createdAt);
    }
  }
}
