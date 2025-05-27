import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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
        title: 'Card Types',
        href: '/card-types',
    },
];

interface CardType {
    id: number
    title: string;
    active: boolean;
    createdAt: string;

}

interface PageProps {
    flash: {
        message?: string;
    },
    cardTypes: CardType[],
}


export default function CardTypes() {
    const { data, setData, post, errors } = useForm({
        title: '',
        active: true as boolean, // Explicitly type active as boolean
    });

    const { cardTypes, flash } = usePage().props as unknown as PageProps;

    const {processing, delete: destroy} = useForm();
    const { data: editData, setData: setEditData, put: update, errors: editErrors, reset: resetEditForm, processing: editProcessing } = useForm({
        id: null as number | null,
        title: '',
        active: false as boolean, // Explicitly type active as boolean
    });

    const [editingCardType, setEditingCardType] = React.useState<CardType | null>(null);


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
        post(route('card-types.store'), {
            onSuccess: () => {
                toast.success('Card Type Created Successfully');
            }
        });
    };

    const handleDelete = (id: number)=> {
        destroy(route('card-types.destroy', id), {
            onSuccess: () => toast.success('Card Type Deleted Successfully')
        });
    }

    const handleEditClick = (cardType: CardType) => {
        setEditingCardType(cardType);
        setEditData({
            id: cardType.id,
            title: cardType.title,
            active: cardType.active,
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCardType) {
            update(route('card-types.update', editingCardType.id), {
                onSuccess: () => {
                    // toast.success('Card Type Updated Successfully');
                    setEditingCardType(null);
                    resetEditForm();
                    const closeButton = document.querySelector('#editSheetCloseButton');
                    if (closeButton instanceof HTMLElement) {
                        closeButton.click();
                    }
                }
            });
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Card Types" />

            <div className={'m-4'}>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="default">New Card Type</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create a New Card Type</SheetTitle>
                            <SheetDescription>
                                Fill the form and click Create button in order to create a new Card Type
                            </SheetDescription>
                        </SheetHeader>
                        <div className={"h-full"}>
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-6 h-full p-4"
                            >
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Card Type Title"
                                        value={data.title}
                                        required={true}
                                        onChange={(e) => setData('title', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="active"
                                        checked={data.active}
                                        onCheckedChange={(checked) => setData('active', !!checked)} // Changed to !!checked to ensure boolean
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
                                    <Button type="submit" className="w-full mt-auto" disabled={data.title === ''}>
                                        Create a New Card Type
                                    </Button>
                                </SheetClose>
                            </form>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            {cardTypes.length > 0 && (
                <div className={'flex ml-4'}>
                    <Table>
                        <TableCaption>A list of your card types.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cardTypes.map((type) => (
                                <TableRow key={type.id}>
                                    <TableCell className="font-medium">{type.id}</TableCell>
                                    <TableCell>{type.title}</TableCell>
                                    <TableCell>{type.active ? <Badge>Yes</Badge> : <Badge variant={"destructive"}>No</Badge>}</TableCell>
                                    <TableCell>{type.createdAt}</TableCell>

                                    <TableCell className="text-center space-x-2">

                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="default" className={'bg-slate-500 hover:bg-slate-700'} onClick={() => handleEditClick(type)}>Edit</Button>
                                            </SheetTrigger>
                                            <SheetContent>
                                                <SheetHeader>
                                                    <SheetTitle>Edit Card Type</SheetTitle>
                                                    <SheetDescription>
                                                        Modify the form and click Save Changes button to update the Card Type.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className={"h-full"}>
                                                    <form
                                                        onSubmit={handleUpdateSubmit}
                                                        className="flex flex-col gap-6 h-full p-4"
                                                    >
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="edit-title">Title</Label>
                                                            <Input
                                                                id="edit-title"
                                                                placeholder="Card Type Title"
                                                                value={editData.title}
                                                                required={true}
                                                                onChange={(e) => setEditData('title', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2">
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
                                                            <Button id="editSheetCloseButton" type="submit" className="w-full mt-auto" disabled={editData.title === '' || editProcessing}>
                                                                Save Changes
                                                            </Button>
                                                        </SheetClose>
                                                    </form>
                                                </div>
                                            </SheetContent>
                                        </Sheet>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className={'bg-red-500 hover:bg-red-700'} disabled={processing} >Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent >
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. {type.title} will permanently delete and remove your data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className={'bg-red-500 hover:bg-red-700'} disabled={processing} onClick={() => {handleDelete(type.id)}}>Delete</AlertDialogAction>
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
