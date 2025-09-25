import { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AREAS_DISPONIVEIS } from '@/services/dataProvider';
import { cn } from '@/lib/utils';

export interface FiltersValue {
  q: string;
  areas: string[];
  precoMin: string;
  precoMax: string;
  order: 'preco_asc' | 'preco_desc' | '';
}

interface FiltersBarProps {
  value: FiltersValue;
  onChange: (filters: FiltersValue) => void;
  className?: string;
}

export function FiltersBar({ value, onChange, className }: FiltersBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação de preços
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (value.precoMin && isNaN(parseFloat(value.precoMin))) {
      newErrors.precoMin = 'Preço mínimo deve ser um número válido';
    }

    if (value.precoMax && isNaN(parseFloat(value.precoMax))) {
      newErrors.precoMax = 'Preço máximo deve ser um número válido';
    }

    if (
      value.precoMin && 
      value.precoMax && 
      !isNaN(parseFloat(value.precoMin)) && 
      !isNaN(parseFloat(value.precoMax)) &&
      parseFloat(value.precoMin) > parseFloat(value.precoMax)
    ) {
      newErrors.precoMax = 'Preço máximo deve ser maior que o mínimo';
    }

    setErrors(newErrors);
  }, [value.precoMin, value.precoMax]);

  const updateFilter = (key: keyof FiltersValue, newValue: any) => {
    onChange({ ...value, [key]: newValue });
  };

  const toggleArea = (area: string) => {
    const newAreas = value.areas.includes(area)
      ? value.areas.filter(a => a !== area)
      : [...value.areas, area];
    updateFilter('areas', newAreas);
  };

  const clearAllFilters = () => {
    onChange({
      q: '',
      areas: [],
      precoMin: '',
      precoMax: '',
      order: ''
    });
  };

  const hasActiveFilters = value.q || value.areas.length > 0 || value.precoMin || value.precoMax || value.order;

  return (
    <Card className={cn("gradient-surface shadow-card", className)}>
      <CardContent className="p-4">
        {/* Busca Principal - Sempre Visível */}
        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="search-mentores" className="sr-only">
              Buscar mentores por nome ou bio
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-mentores"
                type="text"
                placeholder="Buscar mentores por nome ou bio..."
                value={value.q}
                onChange={(e) => updateFilter('q', e.target.value)}
                className="pl-9 pr-4"
                aria-label="Buscar mentores por nome ou bio"
              />
            </div>
          </div>

          {/* Botão para expandir filtros avançados */}
          <div className="flex items-center justify-between">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-2"
                  aria-expanded={isOpen}
                  aria-controls="advanced-filters"
                >
                  <Filter className="h-4 w-4" />
                  Filtros avançados
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {(value.areas.length > 0 ? 1 : 0) + 
                       (value.precoMin || value.precoMax ? 1 : 0) + 
                       (value.order ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent id="advanced-filters" className="space-y-4 mt-4">
                {/* Filtro por Áreas */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Áreas de conhecimento</Label>
                  <div 
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Selecionar áreas de conhecimento"
                  >
                    {AREAS_DISPONIVEIS.map((area) => (
                      <Badge
                        key={area}
                        variant={value.areas.includes(area) ? "default" : "outline"}
                        className="cursor-pointer transition-colors hover:bg-primary/80"
                        onClick={() => toggleArea(area)}
                        role="checkbox"
                        aria-checked={value.areas.includes(area)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleArea(area);
                          }
                        }}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                  {value.areas.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {value.areas.length} área{value.areas.length !== 1 ? 's' : ''} selecionada{value.areas.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Filtro por Preço */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco-min" className="text-sm font-medium">
                      Preço mínimo (R$)
                    </Label>
                    <Input
                      id="preco-min"
                      type="number"
                      min="0"
                      step="5"
                      placeholder="Ex: 50"
                      value={value.precoMin}
                      onChange={(e) => updateFilter('precoMin', e.target.value)}
                      className={cn(errors.precoMin && "border-destructive")}
                      aria-describedby={errors.precoMin ? "preco-min-error" : undefined}
                    />
                    {errors.precoMin && (
                      <p 
                        id="preco-min-error" 
                        className="text-xs text-destructive" 
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.precoMin}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preco-max" className="text-sm font-medium">
                      Preço máximo (R$)
                    </Label>
                    <Input
                      id="preco-max"
                      type="number"
                      min="0"
                      step="5"
                      placeholder="Ex: 200"
                      value={value.precoMax}
                      onChange={(e) => updateFilter('precoMax', e.target.value)}
                      className={cn(errors.precoMax && "border-destructive")}
                      aria-describedby={errors.precoMax ? "preco-max-error" : undefined}
                    />
                    {errors.precoMax && (
                      <p 
                        id="preco-max-error" 
                        className="text-xs text-destructive" 
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.precoMax}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ordenação */}
                <div className="space-y-2">
                  <Label htmlFor="ordenacao" className="text-sm font-medium">
                    Ordenar por
                  </Label>
                  <Select 
                    value={value.order} 
                    onValueChange={(newValue) => updateFilter('order', newValue)}
                  >
                    <SelectTrigger id="ordenacao">
                      <SelectValue placeholder="Selecione a ordenação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Relevância</SelectItem>
                      <SelectItem value="preco_asc">Menor preço</SelectItem>
                      <SelectItem value="preco_desc">Maior preço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Limpar Filtros */}
                {hasActiveFilters && (
                  <div className="pt-2 border-t border-border/50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar todos os filtros
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}