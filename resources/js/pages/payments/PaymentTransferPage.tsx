import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link as InertiaLink, router } from '@inertiajs/react';
import { PageProps as InertiaPageProps, Card as AppCard, User } from '@/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import React from 'react';

// Helper function to format card number for display
const formatCardNumberForDisplay = (cardNumber: string): string => {
    return cardNumber.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
};

// Define types for transaction data
interface TransactionCard extends AppCard {
    user?: User;
}

interface Transaction {
    id: number;
    from_card: TransactionCard;
    to_card: TransactionCard;
    amount: number;
    description: string;
    created_at: string;
}

interface Pagination_Link {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Pagination_Link[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface PaymentPageProps extends InertiaPageProps {
    cards: AppCard[];
    transactions: PaginatedData<Transaction>;
    isAdmin: boolean;
    allUsers?: User[];
    filters?: { user_id?: string };
    errors: {
        from_card_id?: string;
        to_card_number?: string;
        amount?: string;
        message?: string;
    }
}

export default function PaymentTransferPage({ cards, transactions, isAdmin, allUsers, filters, errors: pageErrors }: PaymentPageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        from_card_id: cards.length > 0 ? cards[0].id.toString() : '',
        to_card_number: '',
        amount: '',
    });

    const { flash } = usePage().props as unknown as InertiaPageProps & { flash: { message?: string } };

    React.useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message);
            reset('to_card_number', 'amount');
        }
    }, [flash, reset]);

    React.useEffect(() => {
        if (pageErrors?.message) {
            toast.error(pageErrors.message);
        }
        if (errors.from_card_id) toast.error(errors.from_card_id);
        if (errors.to_card_number) toast.error(errors.to_card_number);
        if (errors.amount) toast.error(errors.amount);
    }, [pageErrors, errors]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('payments.store'), {
            preserveScroll: true,
            onSuccess: () => { },
            onError: () => { },
        });
    };

    const handleToCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleanedValue = e.target.value.replace(/\D/g, '').substring(0, 16);
        setData('to_card_number', cleanedValue);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setData('amount', value);
        }
    };

    const handleUserFilterChange = (userId: string) => {
        router.get(route('payments.index'),
            { user_id: userId || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    return (
        <AppLayout>
            <Head title="Payments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-card text-card-foreground overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Make a Transfer</h2>
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
                                                        {formatCardNumberForDisplay(card.card_number)} (Balance: {typeof card.balance === 'number' ? card.balance.toFixed(2) : parseFloat(card.balance).toFixed(2)})
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
                                        type="text"
                                        value={formatCardNumberForDisplay(data.to_card_number)}
                                        onChange={handleToCardNumberChange}
                                        className="mt-1 block w-full"
                                        maxLength={19}
                                        placeholder="0000 0000 0000 0000"
                                        required
                                    />
                                    <InputError message={errors.to_card_number || pageErrors?.to_card_number} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="text"
                                        value={data.amount}
                                        onChange={handleAmountChange}
                                        className="mt-1 block w-full"
                                        pattern="^\d*\.?\d+$"
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

                    <div className="mt-8 bg-card text-card-foreground overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium mb-4">Transaction History</h3>

                            {isAdmin && allUsers && (
                                <div className="mb-6 max-w-xs">
                                    <Label htmlFor="user_filter">Filter by User</Label>
                                    <Select
                                        value={filters?.user_id || ''}
                                        onValueChange={handleUserFilterChange}
                                    >
                                        <SelectTrigger id="user_filter" className="mt-1">
                                            <SelectValue placeholder="All Users" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Users</SelectItem>
                                            {allUsers.map(user => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name} (ID: {user.id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">From</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">To</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th> {/* Added Status header */}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.data.length > 0 ? (
                                            transactions.data.map((tx) => (
                                                <tr key={tx.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(tx.created_at).toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {tx.from_card.user?.name || 'N/A'}<br />
                                                        <span className="text-xs text-muted-foreground">{formatCardNumberForDisplay(tx.from_card.card_number)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {tx.to_card.user?.name || 'N/A'}<br />
                                                        <span className="text-xs text-muted-foreground">{formatCardNumberForDisplay(tx.to_card.card_number)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{tx.amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">Successful</td> {/* Added Status cell */}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-muted-foreground">No transactions found.</td> {/* Adjusted colSpan from 4 to 5 */}
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {transactions.links.length > 3 && (
                                <nav className="mt-6 flex items-center justify-between border-t border-border pt-4" aria-label="Pagination">
                                    <div className="text-sm text-muted-foreground">
                                        Showing <span className="font-semibold">{transactions.from || 0}</span> to <span className="font-semibold">{transactions.to || 0}</span> of <span className="font-semibold">{transactions.total}</span> results
                                    </div>
                                    <div className="flex space-x-1">
                                        {transactions.links.map((link) => (
                                            <InertiaLink
                                                key={link.label}
                                                href={link.url || '#'}
                                                preserveScroll
                                                preserveState
                                                className={`inline-flex items-center justify-center px-3 py-1.5 border text-sm font-medium rounded-md transition-colors
                                                    ${link.active
                                                        ? 'bg-primary text-primary-foreground border-primary cursor-default'
                                                        : link.url
                                                            ? 'bg-background hover:bg-muted hover:border-muted-foreground border-border'
                                                            : 'bg-background text-muted-foreground cursor-not-allowed opacity-50 border-border'
                                                    }`}
                                                as={!link.url ? 'span' : 'a'}
                                                onClick={(e) => { if (!link.url || link.active) e.preventDefault(); }}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </InertiaLink>
                                        ))}
                                    </div>
                                </nav>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
