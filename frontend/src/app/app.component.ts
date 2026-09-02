import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'sdd-ai-weather-frontend';
	featuredCities = [
		{
			name: 'San Francisco',
			country: 'California, USA',
			heroImage:
				'https://source.unsplash.com/1600x900/?san-francisco,skyline,blue-sky',
			temperature: '72°F',
			status: 'Mostly clear',
			feelsLike: '75°F',
			wind: '8 mph',
			humidity: '54%',
			high: '76°F',
			low: '58°F',
			coverage: '8%'
		},
		{
			name: 'Seattle',
			country: 'Washington, USA',
			heroImage: 'https://source.unsplash.com/1600x900/?seattle,skyline,cloudy',
			temperature: '64°F',
			status: 'Light drizzle',
			feelsLike: '63°F',
			wind: '11 mph',
			humidity: '71%',
			high: '66°F',
			low: '55°F',
			coverage: '62%'
		},
		{
			name: 'Miami',
			country: 'Florida, USA',
			heroImage: 'https://source.unsplash.com/1600x900/?miami,skyline,blue-sky',
			temperature: '86°F',
			status: 'Bright and humid',
			feelsLike: '92°F',
			wind: '14 mph',
			humidity: '68%',
			high: '90°F',
			low: '81°F',
			coverage: '18%'
		},
		{
			name: 'Denver',
			country: 'Colorado, USA',
			heroImage: 'https://source.unsplash.com/1600x900/?denver,mountains,city',
			temperature: '78°F',
			status: 'High sun',
			feelsLike: '79°F',
			wind: '6 mph',
			humidity: '29%',
			high: '82°F',
			low: '60°F',
			coverage: '2%'
		}
	];
	activeCity = this.featuredCities[0];

	get heroBackdropStyle(): Record<string, string> {
		return {
			'--hero-backdrop': `linear-gradient(180deg, rgba(7, 17, 31, 0.2), rgba(7, 17, 31, 0.76)), url('${this.activeCity.heroImage}')`
		};
	}

	selectCity(city: (typeof this.featuredCities)[number]): void {
		this.activeCity = city;
	}
}
