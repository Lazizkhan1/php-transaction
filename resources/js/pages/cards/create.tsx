import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User, type CardType as CardTypeModel } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cards',
        href: route('cards.index'),
    },
    {
        title: 'Create',
        href: route('cards.create'),
    }
];

interface PageProps {
    flash: {
        message?: string;
    },
    users: Pick<User, 'id' | 'name'>[],
    cardTypesList: Pick<CardTypeModel, 'id' | 'title'>[],
    auth: { user: User }; // Added auth to PageProps
}

// Helper function to format card number with spaces every 4 digits
const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || '';
    return formatted.substring(0, 19); // 16 digits + 3 spaces
};

export default function CreateCardPage() {
    const { users, cardTypesList, flash, errors, auth } = usePage().props as unknown as PageProps & { errors: Record<string, string>, auth: { user: User } };

    const { data, setData, post, processing, reset } = useForm({
        user_id: auth.user.role === 'admin' ? (users[0]?.id || '' as number | '') : auth.user.id,
        balance: '0.00',
        card_number: '',
        exp_month: '' as number | '',
        exp_year: '' as number | '',
        cvv: '',
        card_holder: '',
        card_type_id: cardTypesList[0]?.id || '' as number | '',
        active: true as boolean,
    });

    React.useEffect(() => {
        if (flash.message) {
            toast.message(flash.message);
        }
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((er) => toast.error(er as string));
        }
    }, [flash.message, errors]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cards.store'), {
            onSuccess: () => {
                reset();
                toast.success('Card Created Successfully!');
            }
        });
    };

    const currentYear = new Date().getFullYear() % 100;
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i); // Corrected to 10 years for a 10-year range
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Card" />
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <h1 className="text-xl font-semibold mb-4">Create New Card</h1>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {auth.user.role === 'admin' && (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="user_id">User (Owner)</Label>
                                <Select value={data.user_id?.toString()} onValueChange={(value) => setData('user_id', parseInt(value))}>
                                    <SelectTrigger id="user_id">
                                        <SelectValue placeholder="Select User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="card_type_id">Card Type</Label>
                            <Select value={data.card_type_id?.toString()} onValueChange={(value) => setData('card_type_id', parseInt(value))}>
                                <SelectTrigger id="card_type_id">
                                    <SelectValue placeholder="Select Card Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cardTypesList.map(type => (
                                        <SelectItem key={type.id} value={type.id.toString()}>{type.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="card_holder">Card Holder</Label>
                            <Input
                                id="card_holder"
                                placeholder="Card Holder Name"
                                value={data.card_holder}
                                required={true}
                                onChange={(e) => setData('card_holder', e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="card_number">Card Number</Label>
                            <Input
                                id="card_number"
                                placeholder="0000 0000 0000 0000"
                                value={formatCardNumber(data.card_number)}
                                required={true}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\D/g, ''); // Allow only digits
                                    if (rawValue.length <= 16) {
                                        setData('card_number', rawValue);
                                    }
                                }}
                                maxLength={19} // 16 digits + 3 spaces
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="exp_month">Expiry Month</Label>
                                <Select value={data.exp_month?.toString()} onValueChange={(value) => setData('exp_month', parseInt(value))}>
                                    <SelectTrigger id="exp_month">
                                        <SelectValue placeholder="MM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map(month => (
                                            <SelectItem key={month} value={month.toString()}>{month.toString().padStart(2, '0')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="exp_year">Expiry Year</Label>
                                <Select value={data.exp_year?.toString()} onValueChange={(value) => setData('exp_year', parseInt(value))}>
                                    <SelectTrigger id="exp_year">
                                        <SelectValue placeholder="YY" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {years.map(year => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                    id="cvv"
                                    placeholder="123"
                                    value={data.cvv}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, ''); // Allow only digits
                                        if (rawValue.length <= 3) {
                                            setData('cvv', rawValue);
                                        }
                                    }}
                                    maxLength={3}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="balance">Balance</Label>
                                <Input
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.balance}
                                    required={true}
                                    onChange={(e) => setData('balance', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="active"
                                checked={data.active}
                                onCheckedChange={(checked) => setData('active', !!checked)}
                            />
                            <label
                                htmlFor="active"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Active
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('cards.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing || !data.card_holder || data.card_number.length !== 16 || (data.cvv !== '' && data.cvv.length !== 3) || !data.user_id || !data.card_type_id || !data.exp_month || !data.exp_year}>
                                Create Card
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
