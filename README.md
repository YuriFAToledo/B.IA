# B.IA - Integrating Accessibility Checks into Your CI/CD Pipeline

## Introduction

B.IA is a GitHub Action designed to enable and facilitate companies to adopt a step in their CI/CD pipeline that checks the accessibility of their code. To do this, they simply need to define at least one target audience and a percentage of guidelines to be met. This allows companies to avoid the learning curve costs and external solutions to make their products accessible, by just adding a step capable of understanding whether the produced code complies with the WCAG guidelines impacting the defined audience.

This provides flexibility in accessibility, allowing companies to focus on the accessibility of an audience that represents a larger share and, consequently, higher revenue for them. It's common for companies attempting to be accessible to try to cover various audiences, which is ineffective or harms the performance of the solution.

## Features

- **Guideline Mapping**: Maps the guidelines and their impact on each audience.
- **AI Analysis**: Uses AI to analyze and measure guidelines of a more abstract nature.

## Inputs

- `requirements`: A JSON string object, for example: `{"totalBlindness":1.0}`. This input allows the user to define an audience and the percentage of guidelines to be met, where `1.0` indicates that all guidelines must be accepted.

- `geminiApiToken`: A string with the Gemini key of the company/user (it is strongly recommended to use secrets).

- `githubToken`: Should by default be the value `${{ secrets.GITHUB_TOKEN }}`, as each action trigger automatically generates the GitHub Token. This explanation should be clear to the user.

## Outputs

The outcome is that the developer's push/pull request will be accepted or blocked based on the defined requirements. If the code does not meet at least one guideline, an AI-generated report/feedback is produced to help the developer correct the solution.

## Usage

### Prerequisites

- Have a valid `geminiApiToken`.
- Define at least one audience in `requirements`.
- Have a workflow directory (`.github/workflows`) with an execution YAML file.

### Adding to the Pipeline

To add our solution to the pipeline, include the following in your workflow file:

## Example

### Workflow Example

```yaml
name: Test B.IA Accessibility Checker

on:
  push:
    branches:
      - main
  pull_request_target:
    branches:
      - main

jobs:
  test_accessibility_action:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2  # Ensure both "before" and "after" commits are fetched

      - name: B.IA Accessibility Checker
        uses: YuriFAToledo/B.IA@v0.1.14
        with:
          requirements: '{"totalBlindness":1.0}'
          geminiApiToken: '${{ secrets.GEMINI_API_TOKEN }}'
          githubToken: '${{ secrets.GITHUB_TOKEN }}'
```


## Supported Audiences

Currently, we support the following audiences:

- `totalBlindness`: Has 5 guidelines.

## License

This project is licensed under the **MIT** license.

## Contributing

To report bugs or request features, please use the GitHub issues system.

## Acknowledgements

Developed for the TEDAI hackathon.

## Contact Information

For more information, please contact:

- yuri.toledo@sou.inteli.edu.br
- gabriel.alves@sou.inteli.edu.br
