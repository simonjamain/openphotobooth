export default {
    cancellationDecision: {
        title: 'Confirm this sequence',
        subtitle: 'Review the photo(s), then cancel or continue to print.',
        emptyPreview: 'Preview unavailable, but the captured image(s) are ready.',
        photosCount: '{count} photo(s)',
        help: 'Continue to print this sequence, or cancel and return to flow selection.',
        capturedPhotoAria: 'Captured photo {index}',
        selectedPhotoAria: 'Selected captured photo {index}',
        capturedPhotosAriaLabel: 'Captured photos',
        cancelInputTitle: 'Cancel action input',
        printInputTitle: 'Print action input',
    },
    copiesSelector: {
        nodeName: 'Copies selector',
        title: 'How many copies?',
        subtitle: 'Choose the number of copies, then validate to continue.',
        validate: 'Validate copies',
        increaseInputTitle: 'Increase copies input',
        decreaseInputTitle: 'Decrease copies input',
        validateInputTitle: 'Validate input',
        maxCopiesTitle: 'Maximum copies',
    },
    cancellationNode: {
        nodeName: 'Cancellation decision',
    },
} as const
