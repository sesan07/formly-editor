import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'lib-card-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent],
  template: `
    <mat-card>
      @if (props['cardTitle']) {
        <mat-card-header>
          <mat-card-title>{{ props['cardTitle'] }}</mat-card-title>
          @if (props['cardSubtitle']) {
            <mat-card-subtitle>{{ props['cardSubtitle'] }}</mat-card-subtitle>
          }
        </mat-card-header>
      }
      <mat-card-content style="padding-top: 8px;">
        <ng-container #fieldComponent />
      </mat-card-content>
    </mat-card>
  `,
})
export class CardWrapper extends FieldWrapper {}
