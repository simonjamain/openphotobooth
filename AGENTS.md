# AI Agents guidelines

## Product goal

This will be an open-source photobooth app.

> A photobooth is an app running on a device, usually linked to a camera and a printer that allow guests to take and print photos of them during events.

This app will be responsible to take user inputs (like the command to take a picture), take photos, process them, and print them.

## Tech stack

- web native progressive web app (PWA) (frontend-only)
- no backend, everything runs client-side
- written in typescript/vue.js/vite

## Core functionality

The app will be looping across 4 main steps (except for configuration screens and stuff) :

- 1 User select a flow
  - note : if only one flow is active, the app will skip the flow selection step and go directly to taking the photo(s)
- 2 User take the photo(s)
- 3 Processing (applying filters, archiving, printing, ...) the photo(s)
    - Those nodes take an array of images as input and return another array of images as output that can be altered or not (also the number of images can change). Those node are the base blocks of the processing chain, they can be used for outputs, like printing, or for further processing, like applying filters or archiving.

A flow is composed of a set of steps, starting with an entry node responsible for orchestrating the taking of one or more pictures.

A flow is configured like this :

- flow metadata
  - name
  - order
    if multiple flows are available, the order will be used to display them in the UI
    this is probably selected in a parent screen, like a "flows selection" screen
- pipeline configuration
    - entry node selection (and configuration)
        - the entry node has a vue component responsible for orchestrating the taking of one or more pictures, and returning an array of images to the processing pipeline
    - camera node selection (and configuration)
    - processing node(s) selection and ordering(and configuration)

The app is aimed to be highly modular, so that available nodes are provided by extensions.

- extension example A : upload photos to google drive
    - (processing) node 1 : upload to google drive
        - options
            - linking your account
            - choosing output folder
            - file naming
            - choosing what photos to upload (unprocessed, processed, both, ...)
- extension example B : multi-pictures strip
    - (entry) node 1 : multi-photos taking sequence
        - options
    - (processing) node 2 : apply a multi-photo strip template
        - options
            - choose or upload a template
- extension example C : DNP hot folder printing
    - (processing) node 1 : copy the processed photos into the hot folder used by the printing app
        - options
            - choose the hot folder used by the printing app
- extension example D : IA prompt image processing
    - (processing) node 1 : apply IA prompt image processing
        - options
            - choose the IA model to use
            - choose the prompt to use
            - set the user token
- extension example E : custom image processing
    - (processing) node 1 : apply custom image processing
        - options
            - choose the processing script/command to use
- extension example F : green screen background removal
    - (processing) node 1 : apply green screen background removal
        - options
            - choose the background image to use
- extension example G : digicamcontrol tethering
    - (camera) node 1 : take photos using tethered camera
        - options
            - change the default digicamcontrol api url

### MVP

The base app will include the following extensions :

- single photo taking
    - (entry) node 1 : take a single photo
        - options
            - choose a delay before taking the photo
- digicamcontrol tethering
    - (camera) node 1 : take photos using tethered camera
        - options
            - change the default digicamcontrol api url
            - choose the folder where digicamcontrol will save the photos (to get them back for processing)
- hot folder printing
    - (output) node 1 : copy the processed photos into the hot folder used by the printing app
        - options
            - choose the hot folder used by the printing app
            - set delay for printing (to ensure printer has time to print before the next photo is sent to it)

> Note : no processing, no archiving

### Philosophy

1. For sake of simplicity and end-user focused philosophy, plugins will be bundled (open-source and PR based to include new ones)
2. I will stick with browser only runtime constraints for as long as needed (tho plugins could theorically work with/need third-party modules).
3. The focus is to be able to work in all sort of events, so that can implie offline or unstable internet acces, so I think that this app will have a strong emphasis on offline capabilities. And plugins who needs online capabilities will have to be very carefull, resilient, and very clear (toward the user) about internet stability requirements
4. What to persist accross restarts ? configuration for sure, but for the rest, i would choose (or exclude for that matters) what serve best simplicity and resilience
5. I would like to adopt a clean plugin-ready design for the get-go

## development philosophy

We like to keep things really simple with no unnecessary dependencies and just a very very simple ui at first to test core features.

Agents will not try to exceed excpectations and will only implement the bare minimum to ensure a correct workflow.

## coding style

- serializable typescript interfaces and bindable functions over classes
- zod schema for every uncontrolled input, trust in static typescript types for controlled input
- readable names in plain english (camelCase for variables/functions & PascalCase for types)
- early returns over nested structures
- hexagonal architecture
- in Vue composables, prefer `ref` over `reactive`
- prefer for(of/in) loops over .forEach() and whenever it is an option, for better readability and more intuitive await behaviour

## Continuous improvement/learning

Agents will improve this file over time as we learn more about the project and its requirements. This file will be a living document that will evolve as the project progresses.

Agents will also try to keep this document clean and try to remove/shrink unnecessary details and information as we learn more about the project and its requirements. This file will be a living document that will evolve as the project progresses.
