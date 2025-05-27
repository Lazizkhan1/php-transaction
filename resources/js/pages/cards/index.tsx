import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User, type CardType as CardTypeModel } from '@/types'; // Assuming CardType is also in types
import { Head, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import React from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cards',
        href: route('cards.index'),
    },
];

interface Card {
    id: number;
    user_id: number;
    balance: string; // decimal is often string in JS
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvv: string | null;
    card_holder: string;
    card_type_id: number;
    active: boolean;
    created_at: string;
    updated_at: string;
    user: User; // Assuming User model is available
    card_type: CardTypeModel; // Assuming CardType model is available
}

interface PageProps {
    flash: {
        message?: string;
    },
    cards: Card[],
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

export default function CardsPage() {
    const { cards, users, cardTypesList, flash, auth } = usePage().props as unknown as PageProps;

    const { data, setData, post, errors, reset, processing } = useForm({
        user_id: auth.user.role === 'admin' ? (users[0]?.id || '' as number | '') : auth.user.id,
        balance: '0.00',
        card_number: '',
        exp_month: '' as number | '', // Allow empty string for placeholder
        exp_year: '' as number | '',
        cvv: '',
        card_holder: '',
        card_type_id: cardTypesList[0]?.id || '' as number | '',
        active: true as boolean,
    });

    const { data: editData, setData: setEditData, put: update, errors: editErrors, reset: resetEditForm, processing: editProcessing } = useForm({
        id: null as number | null,
        user_id: '' as number | '',
        balance: '0.00',
        card_number: '',
        exp_month: '' as number | '',
        exp_year: '' as number | '',
        cvv: '',
        card_holder: '',
        card_type_id: '' as number | '',
        active: false as boolean,
    });

    const [editingCard, setEditingCard] = React.useState<Card | null>(null);


    React.useEffect(() => {
        if (flash.message) {
            toast.message(flash.message);
        }
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((er) => toast.error(er as string));
        }
        if (Object.keys(editErrors).length > 0) {
            Object.values(editErrors).forEach((er) => toast.error(er as string));
        }
    }, [errors, editErrors, flash.message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cards.store'), {
            onSuccess: () => {
                reset();
                const closeButton = document.querySelector('#createSheetCloseButton');
                if (closeButton instanceof HTMLElement) {
                    closeButton.click();
                }
            }
        });
    };

    const { delete: destroy, processing: deleteProcessing } = useForm();

    const handleDelete = (id: number)=> {
        destroy(route('cards.destroy', id));
    }

    const handleEditClick = (card: Card) => {
        setEditingCard(card);
        setEditData({
            id: card.id,
            user_id: card.user_id,
            balance: card.balance,
            card_number: card.card_number,
            exp_month: card.exp_month,
            exp_year: card.exp_year,
            cvv: card.cvv || '',
            card_holder: card.card_holder,
            card_type_id: card.card_type_id,
            active: card.active,
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCard) {
            update(route('cards.update', editingCard.id), {
                onSuccess: () => {
                    setEditingCard(null);
                    resetEditForm();
                    const closeButton = document.querySelector('#editSheetCloseButton');
                    if (closeButton instanceof HTMLElement) {
                        closeButton.click();
                    }
                }
            });
        }
    };

    const currentYear = new Date().getFullYear() % 100; // Get last two digits of current year
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i); // Corrected to 10 years for a 10-year range
    const months = Array.from({ length: 12 }, (_, i) => i + 1);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cards" />

            <div className={'m-4'}>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="default">New Card</Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[525px]">
                        <SheetHeader>
                            <SheetTitle>Create a New Card</SheetTitle>
                            <SheetDescription>
                                Fill the form and click Create button to create a new Card.
                            </SheetDescription>
                        </SheetHeader>
                        <div className={"h-[calc(100%-theme(space.24))] overflow-y-auto"}>
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-3 p-4"
                            >
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

                                <div className="grid grid-cols-2 gap-3">
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
                                            <SelectContent className="max-h-[200px]"> {/* Added max-h for scrollability */}
                                                {years.map(year => (
                                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
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
                                <div className="flex-1" />
                                <SheetClose asChild>
                                    <Button id="createSheetCloseButton" type="submit" className="w-full mt-auto" disabled={processing || !data.card_holder || data.card_number.length !== 16 || (data.cvv !== '' && data.cvv.length !== 3) || !data.user_id || !data.card_type_id || !data.exp_month || !data.exp_year}>
                                        Create New Card
                                    </Button>
                                </SheetClose>
                            </form>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            {cards.length > 0 && (
                <div className={'flex ml-4'}>
                    <Table>
                        <TableCaption>A list of your cards.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Card Holder</TableHead>
                                <TableHead>Card Number</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Card Type</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cards.map((card) => (
                                <TableRow key={card.id}>
                                    <TableCell className="font-medium">{card.id}</TableCell>
                                    <TableCell>{card.card_holder}</TableCell>
                                    <TableCell>**** **** **** {card.card_number.slice(-4)}</TableCell>
                                    <TableCell>{card.user.name}</TableCell>
                                    <TableCell>{card.card_type.title}</TableCell>
                                    <TableCell>${parseFloat(card.balance).toFixed(2)}</TableCell>
                                    <TableCell>{card.exp_month.toString().padStart(2,'0')}/{card.exp_year}</TableCell>
                                    <TableCell>{card.active ? <Badge>Yes</Badge> : <Badge variant={"destructive"}>No</Badge>}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="default" className={'bg-slate-500 hover:bg-slate-700'} onClick={() => handleEditClick(card)}>Edit</Button>
                                            </SheetTrigger>
                                            <SheetContent className="sm:max-w-[525px]">
                                                <SheetHeader>
                                                    <SheetTitle>Edit Card</SheetTitle>
                                                    <SheetDescription>
                                                        Modify the form and click Save Changes to update the Card.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className={"h-[calc(100%-theme(space.24))] overflow-y-auto"}>
                                                    <form
                                                        onSubmit={handleUpdateSubmit}
                                                        className="flex flex-col gap-3 p-4"
                                                    >
                                                        {auth.user.role === 'admin' && (
                                                            <div className="flex flex-col gap-1.5">
                                                                <Label htmlFor="edit-user_id">User (Owner)</Label>
                                                                <Select value={editData.user_id?.toString()} onValueChange={(value) => setEditData('user_id', parseInt(value))}>
                                                                    <SelectTrigger id="edit-user_id">
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
                                                            <Label htmlFor="edit-card_type_id">Card Type</Label>
                                                            <Select value={editData.card_type_id?.toString()} onValueChange={(value) => setEditData('card_type_id', parseInt(value))}>
                                                                <SelectTrigger id="edit-card_type_id">
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
                                                            <Label htmlFor="edit-card_holder">Card Holder</Label>
                                                            <Input
                                                                id="edit-card_holder"
                                                                placeholder="Card Holder Name"
                                                                value={editData.card_holder}
                                                                required={true}
                                                                onChange={(e) => setEditData('card_holder', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="flex flex-col gap-1.5">
                                                            <Label htmlFor="edit-card_number">Card Number</Label>
                                                            <Input
                                                                id="edit-card_number"
                                                                placeholder="0000 0000 0000 0000"
                                                                value={formatCardNumber(editData.card_number)}
                                                                required={true}
                                                                onChange={(e) => {
                                                                    const rawValue = e.target.value.replace(/\D/g, ''); // Allow only digits
                                                                    if (rawValue.length <= 16) {
                                                                        setEditData('card_number', rawValue);
                                                                    }
                                                                }}
                                                                maxLength={19} // 16 digits + 3 spaces
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="flex flex-col gap-1.5">
                                                                <Label htmlFor="edit-exp_month">Expiry Month</Label>
                                                                <Select value={editData.exp_month?.toString()} onValueChange={(value) => setEditData('exp_month', parseInt(value))}>
                                                                    <SelectTrigger id="edit-exp_month">
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
                                                                <Label htmlFor="edit-exp_year">Expiry Year</Label>
                                                                <Select value={editData.exp_year?.toString()} onValueChange={(value) => setEditData('exp_year', parseInt(value))}>
                                                                    <SelectTrigger id="edit-exp_year">
                                                                        <SelectValue placeholder="YY" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="max-h-[200px]"> {/* Added max-h for scrollability */}
                                                                        {years.map(year => (
                                                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="flex flex-col gap-1.5">
                                                                <Label htmlFor="edit-cvv">CVV</Label>
                                                                <Input
                                                                    id="edit-cvv"
                                                                    placeholder="123"
                                                                    value={editData.cvv}
                                                                    onChange={(e) => {
                                                                        const rawValue = e.target.value.replace(/\D/g, ''); // Allow only digits
                                                                        if (rawValue.length <= 3) {
                                                                            setEditData('cvv', rawValue);
                                                                        }
                                                                    }}
                                                                    maxLength={3}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-1.5">
                                                                <Label htmlFor="edit-balance">Balance</Label>
                                                                <Input
                                                                    id="edit-balance"
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    value={editData.balance}
                                                                    required={true}
                                                                    onChange={(e) => setEditData('balance', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-2 pt-2">
                                                            <Checkbox
                                                                id="edit-active"
                                                                checked={editData.active}
                                                                onCheckedChange={(checked) => setEditData('active', !!checked)}
                                                            />
                                                            <label
                                                                htmlFor="edit-active"
                                                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Active
                                                            </label>
                                                        </div>
                                                        <div className="flex-1" />
                                                        <SheetClose asChild>
                                                            <Button id="editSheetCloseButton" type="submit" className="w-full mt-auto" disabled={editProcessing || !editData.card_holder || editData.card_number.length !== 16 || (editData.cvv !== '' && editData.cvv.length !== 3) || !editData.user_id || !editData.card_type_id || !editData.exp_month || !editData.exp_year}>
                                                                Save Changes
                                                            </Button>
                                                        </SheetClose>
                                                    </form>
                                                </div>
                                            </SheetContent>
                                        </Sheet>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className={'bg-red-500 hover:bg-red-700'} disabled={deleteProcessing} >Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent >
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. Card <Badge variant="outline">{card.card_holder} - {card.card_number.slice(-4)}</Badge> will be permanently deleted.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className={'bg-red-500 hover:bg-red-700'} disabled={deleteProcessing} onClick={() => {handleDelete(card.id)}}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AppLayout>
    );
}
