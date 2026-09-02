import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { EmptyStateComponent } from './shared/empty-state/empty-state.component';
import { ErrorStateComponent } from './shared/error-state/error-state.component';
import { SkeletonComponent } from './shared/skeleton/skeleton.component';

/**
 * The three state components are declared and exported here so every block in
 * the application reaches for the same ones. A new network-backed block
 * should need no new loading, error, or empty presentation.
 */
@NgModule({
	declarations: [AppComponent, SkeletonComponent, ErrorStateComponent, EmptyStateComponent],
	imports: [BrowserModule, HttpClientModule],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
