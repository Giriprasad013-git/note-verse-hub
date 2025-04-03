
import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Save, Plus, Delete, Download, Upload, Table } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpreadsheetEditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

type CellType = 'text' | 'number' | 'formula';

interface Cell {
  id: string;
  value: string;
  type: CellType;
  computed?: string | number;
}

interface Row {
  id: string;
  cells: Cell[];
}

interface SpreadsheetData {
  rows: Row[];
  columns: number;
}

const SpreadsheetEditor: React.FC<SpreadsheetEditorProps> = ({
  initialContent = '',
  pageId,
  onContentChange,
  className,
}) => {
  // Parse initialContent or set default data
  const [data, setData] = useState<SpreadsheetData>(() => {
    try {
      if (initialContent) {
        return JSON.parse(initialContent);
      }
    } catch (e) {
      console.error("Failed to parse spreadsheet data:", e);
    }
    
    // Default data with 3 rows and 3 columns
    return {
      columns: 3,
      rows: Array(3).fill(0).map((_, rowIndex) => ({
        id: `row-${rowIndex}`,
        cells: Array(3).fill(0).map((_, colIndex) => ({
          id: `cell-${rowIndex}-${colIndex}`,
          value: '',
          type: 'text'
        }))
      }))
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [formulaInput, setFormulaInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = () => {
    if (onContentChange) {
      const content = JSON.stringify(data);
      onContentChange(content);
      toast({
        title: "Changes saved",
        description: "Your spreadsheet has been updated"
      });
      setIsEditing(false);
    }
  };
  
  const handleCellChange = (rowId: string, cellId: string, value: string) => {
    setData(prev => {
      const newData = { ...prev };
      const rowIndex = newData.rows.findIndex(r => r.id === rowId);
      if (rowIndex !== -1) {
        const cellIndex = newData.rows[rowIndex].cells.findIndex(c => c.id === cellId);
        if (cellIndex !== -1) {
          newData.rows[rowIndex].cells[cellIndex] = {
            ...newData.rows[rowIndex].cells[cellIndex],
            value,
            computed: evaluateCell(value, newData.rows[rowIndex].cells[cellIndex].type)
          };
        }
      }
      return newData;
    });
    setIsEditing(true);
  };

  const evaluateCell = (value: string, type: CellType) => {
    if (type === 'number') {
      const numValue = parseFloat(value);
      return isNaN(numValue) ? 0 : numValue;
    } else if (type === 'formula' && value.startsWith('=')) {
      // Very simple formula evaluation for basic operations
      try {
        const formulaContent = value.substring(1).trim();
        
        // Handle basic arithmetic with simple regex replacement
        // This is just a basic implementation - a real spreadsheet would need more
        const sanitized = formulaContent
          .replace(/[^0-9+\-*/.() ]/g, '') // Only allow safe characters
          .replace(/\s+/g, ''); // Remove whitespace
        
        if (!sanitized) return 0;
        
        // Simple evaluation - with proper error handling
        try {
          // eslint-disable-next-line no-new-func
          const result = Function(`"use strict"; return (${sanitized})`)();
          return isNaN(result) ? 'Error' : result;
        } catch (e) {
          return 'Error';
        }
      } catch (e) {
        return 'Error';
      }
    }
    return value;
  };
  
  const handleCellTypeChange = (rowId: string, cellId: string, type: CellType) => {
    setData(prev => {
      const newData = { ...prev };
      const rowIndex = newData.rows.findIndex(r => r.id === rowId);
      if (rowIndex !== -1) {
        const cellIndex = newData.rows[rowIndex].cells.findIndex(c => c.id === cellId);
        if (cellIndex !== -1) {
          const cell = newData.rows[rowIndex].cells[cellIndex];
          newData.rows[rowIndex].cells[cellIndex] = {
            ...cell,
            type,
            computed: evaluateCell(cell.value, type)
          };
        }
      }
      return newData;
    });
    setIsEditing(true);
  };
  
  const addRow = () => {
    setData(prev => {
      const newRow: Row = {
        id: `row-${Date.now()}`,
        cells: Array(prev.columns).fill(0).map((_, colIndex) => ({
          id: `cell-${Date.now()}-${colIndex}`,
          value: '',
          type: 'text'
        }))
      };
      
      return {
        ...prev,
        rows: [...prev.rows, newRow]
      };
    });
    setIsEditing(true);
  };
  
  const addColumn = () => {
    setData(prev => {
      const newData = { ...prev };
      newData.columns += 1;
      
      newData.rows = newData.rows.map(row => {
        const newCell: Cell = {
          id: `cell-${Date.now()}-${newData.columns - 1}`,
          value: '',
          type: 'text'
        };
        
        return {
          ...row,
          cells: [...row.cells, newCell]
        };
      });
      
      return newData;
    });
    setIsEditing(true);
  };
  
  const removeRow = (rowId: string) => {
    setData(prev => {
      return {
        ...prev,
        rows: prev.rows.filter(row => row.id !== rowId)
      };
    });
    setIsEditing(true);
  };
  
  const exportToExcel = () => {
    // Create the worksheet data in an XLSX compatible format
    
    // First, convert our data to a format that can be used with SheetJS libraries
    // (while we're not using the actual library here due to size constraints,
    // we'll prepare data in a compatible format for when it's needed)
    
    // Define the sheet headers (A, B, C, etc.)
    const headers = Array(data.columns).fill(0).map((_, i) => {
      // Convert column index to Excel-style column letter (A, B, C, ...)
      const columnIndex = i;
      let columnName = '';
      let dividend = columnIndex + 1;
      let modulo;

      while (dividend > 0) {
        modulo = (dividend - 1) % 26;
        columnName = String.fromCharCode(65 + modulo) + columnName;
        dividend = Math.floor((dividend - modulo) / 26);
      }

      return columnName;
    });

    // Create CSV for export (simple XLSX alternative)
    const rows = data.rows.map(row => 
      row.cells.map(cell => `"${cell.value.replace(/"/g, '""')}"`).join(',')
    );
    
    const csvContent = rows.join('\n');
    
    // Simple download as CSV (which Excel can open)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spreadsheet-export-${pageId}.csv`;
    link.click();
    
    toast({
      title: "Spreadsheet exported",
      description: "Your spreadsheet has been exported as a CSV file that Excel can open"
    });
  };

  // Function to apply basic formatting to cells
  const applyBoldFormat = () => {
    if (!selectedCell) return;

    setData(prev => {
      const newData = { ...prev };
      const cellDetails = selectedCell.split('-');
      if (cellDetails.length >= 3) {
        const rowIndex = parseInt(cellDetails[1]);
        const colIndex = parseInt(cellDetails[2]);
        
        if (rowIndex >= 0 && colIndex >= 0 && rowIndex < newData.rows.length) {
          const row = newData.rows[rowIndex];
          if (colIndex < row.cells.length) {
            const cell = row.cells[colIndex];
            // Apply bold formatting by wrapping text in asterisks (simple markdown style)
            const value = cell.value.startsWith('**') && cell.value.endsWith('**') 
              ? cell.value.substring(2, cell.value.length - 2) 
              : `**${cell.value}**`;
            
            row.cells[colIndex] = { ...cell, value };
          }
        }
      }
      return newData;
    });
    setIsEditing(true);
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Spreadsheet Editor</span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          <Button variant="outline" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
          <Button 
            variant="outline" 
            disabled={!selectedCell}
            onClick={applyBoldFormat}
          >
            <span className="font-bold mr-2">B</span>
            Bold
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSave} disabled={!isEditing}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {data.rows.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No Data Yet</h2>
            <p className="text-muted-foreground mb-4">
              Start by adding rows and columns to your spreadsheet.
            </p>
            <Button onClick={addRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  {Array(data.columns).fill(0).map((_, colIndex) => (
                    <th key={`header-${colIndex}`} className="px-4 py-2 font-semibold text-center">
                      {String.fromCharCode(65 + colIndex)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, rowIndex) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    {row.cells.map((cell, cellIndex) => (
                      <td 
                        key={cell.id} 
                        className={`border-r last:border-r-0 p-0 ${selectedCell === cell.id ? 'bg-blue-50' : ''}`}
                      >
                        <div className="relative min-w-[120px]">
                          <Input
                            value={cell.value}
                            onChange={(e) => handleCellChange(row.id, cell.id, e.target.value)}
                            onFocus={() => setSelectedCell(cell.id)}
                            onBlur={() => setSelectedCell(null)}
                            className="border-0 focus:ring-0 h-10 px-2"
                          />
                          
                          {selectedCell === cell.id && (
                            <div className="absolute top-full left-0 z-10 bg-white border rounded-md shadow-md p-2 mt-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Type:</span>
                              <Select 
                                defaultValue={cell.type} 
                                onValueChange={(value) => handleCellTypeChange(row.id, cell.id, value as CellType)}
                              >
                                <SelectTrigger className="h-7 text-xs w-24">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="formula">Formula</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                    <td className="w-8 p-0">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => removeRow(row.id)}
                        className="h-10 w-8 rounded-none hover:bg-red-50 text-muted-foreground hover:text-red-500"
                      >
                        <Delete className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 p-2 bg-muted/20 border rounded-md">
          <div className="text-xs mb-2 text-muted-foreground">
            <span className="font-medium">Tips:</span> Use formulas starting with = (like =A1+B1). 
            Cell references aren't supported yet, but basic math operations (=5+10) work.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetEditor;
