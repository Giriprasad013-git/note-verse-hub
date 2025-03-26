
import React, { useState } from 'react';
import { FileSpreadsheet, Save, Plus, Delete, FileText } from 'lucide-react';
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
            computed: value
          };
        }
      }
      return newData;
    });
    setIsEditing(true);
  };
  
  const handleCellTypeChange = (rowId: string, cellId: string, type: CellType) => {
    setData(prev => {
      const newData = { ...prev };
      const rowIndex = newData.rows.findIndex(r => r.id === rowId);
      if (rowIndex !== -1) {
        const cellIndex = newData.rows[rowIndex].cells.findIndex(c => c.id === cellId);
        if (cellIndex !== -1) {
          newData.rows[rowIndex].cells[cellIndex] = {
            ...newData.rows[rowIndex].cells[cellIndex],
            type
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
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Spreadsheet Editor</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>
          <Button variant="outline" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
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
      </div>
    </div>
  );
};

export default SpreadsheetEditor;
