export default {
    cancellationDecision: {
        title: 'Confirmer cette sequence',
        subtitle: 'Verifiez la ou les photos, puis annulez ou continuez vers l impression.',
        emptyPreview: 'Aucune previsualisation disponible, mais les images capturees sont pretes.',
        photosCount: '{count} photo(s)',
        help: 'Continuez pour imprimer cette sequence, ou annulez pour revenir a la selection du flow.',
        capturedPhotoAria: 'Photo capturee {index}',
        selectedPhotoAria: 'Photo capturee selectionnee {index}',
        capturedPhotosAriaLabel: 'Photos capturees',
        cancelInputTitle: 'Entree pour annuler',
        printInputTitle: 'Entree pour imprimer',
    },
    copiesSelector: {
        nodeName: 'Selecteur de copies',
        title: 'Combien de copies ?',
        subtitle: 'Choisissez le nombre de copies, puis validez pour continuer.',
        validate: 'Valider les copies',
        increaseInputTitle: 'Entree pour augmenter les copies',
        decreaseInputTitle: 'Entree pour diminuer les copies',
        validateInputTitle: 'Entree de validation',
        maxCopiesTitle: 'Nombre maximum de copies',
    },
    cancellationNode: {
        nodeName: 'Decision d annulation',
    },
} as const
