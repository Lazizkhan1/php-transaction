import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'System settings', href: '/settings/system' },
];

export default function System() {
    const { commission, flash } = usePage<SharedData>().props as SharedData & { flash?: Record<string, string> };

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        commission: commission as number,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('system.update'), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="System settings" description="Configure system parameters" />

                    {flash?.success && <div className="text-sm text-green-600">{flash.success}</div>}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="commission">Commission</Label>
                            <Input
                                id="commission"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={data.commission}
                                onChange={(e) => setData('commission', parseFloat(e.target.value))}
                                required
                            />
                            <InputError className="mt-2" message={errors.commission as string} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
