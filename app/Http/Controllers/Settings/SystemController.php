<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class SystemController extends Controller
{
    /**
     * Show the system settings form.
     */
    public function edit()
    {
        $commission = env('COMMISSION', 0);
        return Inertia::render('settings/system', [
            'commission' => $commission,
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'commission' => ['required', 'numeric', 'min:0'],
        ]);

        $commission = $data['commission'];

        // Update environment file

        // Update .env file
        $envPath = base_path('.env');
        if (file_exists($envPath) && is_writable($envPath)) {
            $env = file_get_contents($envPath);
            $pattern = '/^COMMISSION=.*$/m';
            $replacement = 'COMMISSION='.$commission;
            if (preg_match($pattern, $env)) {
                $env = preg_replace($pattern, $replacement, $env);
            } else {
                $env .= "\n" . $replacement;
            }
            file_put_contents($envPath, $env);
        }

        return redirect()->route('system.edit')->with('success', 'System settings updated.');
    }
}
