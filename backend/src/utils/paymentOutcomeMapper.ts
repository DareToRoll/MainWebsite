export type PaymentStatus = 
    | 'success'
    | 'cancelled'
    | 'declined'
    | 'pending'
    | 'technical_error'
    | 'configuration_error'
    | 'unknown';

export interface PaymentOutcomeDetails {
    status: PaymentStatus;
    title: string;
    message: string;
    canRetry: boolean;
    nextAction?: 'retry' | 'contact_bank' | 'contact_support' | 'wait' | 'use_another_card';
}

/**
 * Map Sherlock's response codes to user-facing payment outcomes
 * Based on SIPS/Sherlock's documentation
 */
export function mapPaymentOutcome(
    responseCode?: string,
    acquirerResponseCode?: string
): PaymentOutcomeDetails {
    // Primary response codes (Sherlock's level)
    switch (responseCode) {
        case '00':
            return {
                status: 'success',
                title: 'Paiement réussi !',
                message: 'Votre paiement a été traité avec succès. Vous allez recevoir un email de confirmation dans quelques instants.',
                canRetry: false,
            };

        case '17':
            return {
                status: 'cancelled',
                title: 'Paiement annulé',
                message: 'Vous avez annulé le paiement. Aucun montant n\'a été débité.',
                canRetry: true,
                nextAction: 'retry',
            };

        case '34':
            return {
                status: 'configuration_error',
                title: 'Erreur technique',
                message: 'Une erreur de configuration est survenue. Veuillez contacter notre service client.',
                canRetry: false,
                nextAction: 'contact_support',
            };

        case '60':
            return {
                status: 'pending',
                title: 'Paiement en cours',
                message: 'Votre paiement est en cours de traitement. Vous recevrez une confirmation par email sous peu.',
                canRetry: false,
                nextAction: 'wait',
            };

        case '99':
            return {
                status: 'technical_error',
                title: 'Service temporairement indisponible',
                message: 'Le service de paiement est temporairement indisponible. Veuillez réessayer dans quelques instants.',
                canRetry: true,
                nextAction: 'retry',
            };
    }

    // Check acquirer response codes for declined payments
    if (acquirerResponseCode && acquirerResponseCode !== '00') {
        return mapAcquirerResponseCode(acquirerResponseCode);
    }

    // Default for unknown errors
    return {
        status: 'unknown',
        title: 'Erreur de paiement',
        message: 'Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer ou contacter notre service client.',
        canRetry: true,
        nextAction: 'retry',
    };
}

/**
 * Map acquirer/issuer response codes to user-friendly messages
 */
function mapAcquirerResponseCode(code: string): PaymentOutcomeDetails {
    switch (code) {
        case '05':
            return {
                status: 'declined',
                title: 'Paiement refusé',
                message: 'Votre banque a refusé le paiement. Veuillez contacter votre banque ou utiliser un autre moyen de paiement.',
                canRetry: true,
                nextAction: 'contact_bank',
            };

        case '51':
            return {
                status: 'declined',
                title: 'Fonds insuffisants',
                message: 'Le paiement a été refusé en raison de fonds insuffisants. Veuillez utiliser un autre moyen de paiement.',
                canRetry: true,
                nextAction: 'use_another_card',
            };

        case '54':
            return {
                status: 'declined',
                title: 'Carte expirée',
                message: 'Votre carte bancaire est expirée. Veuillez utiliser une autre carte.',
                canRetry: true,
                nextAction: 'use_another_card',
            };

        case '55':
            return {
                status: 'declined',
                title: 'Code PIN incorrect',
                message: 'Le code PIN saisi est incorrect. Veuillez réessayer avec le bon code.',
                canRetry: true,
                nextAction: 'retry',
            };

        case '34':
            return {
                status: 'declined',
                title: 'Suspicion de fraude',
                message: 'Le paiement a été refusé pour des raisons de sécurité. Veuillez contacter votre banque.',
                canRetry: false,
                nextAction: 'contact_bank',
            };

        case '41':
        case '43':
            return {
                status: 'declined',
                title: 'Carte bloquée',
                message: 'Votre carte a été signalée comme perdue ou volée. Veuillez contacter votre banque.',
                canRetry: false,
                nextAction: 'contact_bank',
            };

        case '57':
            return {
                status: 'declined',
                title: 'Transaction non autorisée',
                message: 'Ce type de transaction n\'est pas autorisé pour cette carte. Veuillez utiliser un autre moyen de paiement.',
                canRetry: true,
                nextAction: 'use_another_card',
            };

        case '75':
            return {
                status: 'declined',
                title: 'Tentatives dépassées',
                message: 'Nombre maximal de tentatives de saisie du code PIN dépassé. Veuillez contacter votre banque.',
                canRetry: false,
                nextAction: 'contact_bank',
            };

        default:
            return {
                status: 'declined',
                title: 'Paiement refusé',
                message: 'Le paiement a été refusé par votre banque. Veuillez réessayer ou utiliser un autre moyen de paiement.',
                canRetry: true,
                nextAction: 'retry',
            };
    }
}
