## How to locally build website.

From project root, run:
`sphinx-build docs docs/_build`

The **calendar won't be up to date** until you push to the main branch because `FullCalendar` requires a hosted URL to load the `calendar.ics` file. 
But you should check that the calendar file looks ok before you do this.

## GitHub Actions

We use a GitHub Actions workflow to deploy [the website](https://jean-golding-institute.github.io/grapho_workshop/) when anybody *pushes* to the `main` branch. 
This:
 - spins up a cloud instance
 - installs the necessary Python packages
 - runs sphinx, which
    - builds the website files 
    - runs the `sphinx-cal` extension which builds the `calendar.ics` file
 - saves the calendar.ics file to the `main` branch
 - saves the entire website (`_build` directory) to the gh-pages branch. 