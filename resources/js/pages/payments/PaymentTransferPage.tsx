import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps, Card } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import React from 'react';

// Helper function to format card number for display

const formatCardNumberForDisplay = (cardNumber: string): string => {
    // Remove all non-digits first, then group by 4 and add spaces
    return cardNumber.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
};

interface PaymentPageProps extends PageProps {
    cards: Card[];
    success?: string;
    errors: {
        from_card_id?: string;
        to_card_number?: string;
        amount?: string;
        error?: string; // General error
    }
}

export default function PaymentTransferPage({ cards, errors: pageErrors }: PaymentPageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        from_card_id: cards.length > 0 ? cards[0].id.toString() : '',
        to_card_number: '', // This will store the clean, digits-only card number
        amount: '',
    });

    const { flash } = usePage().props as unknown as PageProps;



    React.useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
            reset('to_card_number', 'amount');
        }
    }, [flash, reset]);

    React.useEffect(() => {
        // Display general error from backend if present
        if (pageErrors?.error) {
            toast.error(pageErrors.error);
        }
        // Display specific field errors from Inertia form helper
        if (errors.from_card_id) toast.error(errors.from_card_id);
        if (errors.to_card_number) toast.error(errors.to_card_number);
        if (errors.amount) toast.error(errors.amount);
    }, [pageErrors, errors]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('payments.store'), {
            preserveScroll: true,
            onError: () => {
                // Errors are handled by InputError components and the useEffect for pageErrors.error
            },
        });
    };

    const handleToCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Remove all non-digit characters (handles pasted values with spaces)
        const cleanedValue = rawValue.replace(/\D/g, '');
        // Limit to 16 digits
        const truncatedValue = cleanedValue.substring(0, 16);
        setData('to_card_number', truncatedValue); // Store the clean, digits-only value
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and a single decimal point
        if (/^\d*\.?\d*$/.test(value)) {
            setData('amount', value);
        }
    };

    return (
        <AppLayout>
            <Head title="Payments" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-card text-card-foreground overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="from_card_id">From Card</Label>
                                    <Select value={data.from_card_id} onValueChange={(value) => setData('from_card_id', value)}>
                                        <SelectTrigger id="from_card_id">
                                            <SelectValue placeholder="Select a card" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cards.length > 0 ? (
                                                cards.map((card) => (
                                                    <SelectItem key={card.id} value={card.id.toString()}>
                                                        {card.card_number} (Balance: {card.balance})
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-cards" disabled>
                                                    No active cards available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.from_card_id || pageErrors?.from_card_id} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="to_card_number">Receiver Card Number</Label>
                                    <Input
                                        id="to_card_number"
                                        type="text" // Keep as text to allow spaces for display formatting
                                        value={formatCardNumberForDisplay(data.to_card_number)} // Display formatted value
                                        onChange={handleToCardNumberChange}
                                        className="mt-1 block w-full"
                                        maxLength={19} // Max length with spaces (16 digits + 3 spaces)
                                        placeholder="0000 0000 0000 0000"
                                        // pattern is not strictly needed here as we format and clean, but can be indicative
                                        // pattern="[0-9 ]{19}"
                                        title="Receiver card number must be 16 digits."
                                        required
                                    />
                                    <InputError message={errors.to_card_number || pageErrors?.to_card_number} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="text" // Using text to allow custom decimal handling
                                        value={data.amount}
                                        onChange={handleAmountChange}
                                        className="mt-1 block w-full"
                                        pattern="^\d*\.?\d+$" // Allows numbers and one decimal
                                        title="Amount must be a valid number (e.g., 10.50)."
                                        required
                                    />
                                    <InputError message={errors.amount || pageErrors?.amount} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end">
                                    <Button type="submit" disabled={processing || cards.length === 0}>
                                        Transfer
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
