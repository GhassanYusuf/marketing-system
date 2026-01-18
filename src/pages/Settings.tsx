import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Globe, DollarSign, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/data/countries';
import { currencies } from '@/data/currencies';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>(() => localStorage.getItem('selectedCountry') || 'United States');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => localStorage.getItem('selectedCurrency') || 'USD');
  const [countryOpen, setCountryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(country =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.code.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  // Filter currencies based on search
  const filteredCurrencies = useMemo(() => {
    if (!currencySearch) return currencies;
    return currencies.filter(currency =>
      currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(currencySearch.toLowerCase())
    );
  }, [currencySearch]);

  const selectedCountryData = countries.find(c => c.name === selectedCountry);
  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    localStorage.setItem('selectedCountry', country);
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    localStorage.setItem('selectedCurrency', currency);
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Configure your preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={countryOpen} className="w-full justify-between">
                  {selectedCountry ? countries.find((country) => country.name === selectedCountry)?.flag + ' ' + selectedCountry : "Select country..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search country..."
                    value={countrySearch}
                    onValueChange={setCountrySearch}
                  />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCountries.map((country) => (
                        <CommandItem
                          key={country.name}
                          value={country.name}
                          onSelect={(currentValue) => {
                            handleCountryChange(currentValue === selectedCountry ? "" : currentValue);
                            setCountryOpen(false);
                            setCountrySearch('');
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountry === country.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {country.flag} {country.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={currencyOpen} className="w-full justify-between">
                  {selectedCurrency ? currencies.find((currency) => currency.code === selectedCurrency)?.symbol + ' ' + selectedCurrency : "Select currency..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search currency..."
                    value={currencySearch}
                    onValueChange={setCurrencySearch}
                  />
                  <CommandList>
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandGroup>
                      {filteredCurrencies.map((currency) => (
                        <CommandItem
                          key={currency.code}
                          value={currency.code}
                          onSelect={(currentValue) => {
                            handleCurrencyChange(currentValue === selectedCurrency ? "" : currentValue);
                            setCurrencyOpen(false);
                            setCurrencySearch('');
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCurrency === currency.code ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {currency.symbol} {currency.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => {
              toast({
                title: "Settings saved",
                description: "Your currency and country preferences have been updated.",
              });
            }}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
