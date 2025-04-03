
import React, { useState, useRef } from 'react';
import { Table as TableIcon, Save, Plus, Delete, ArrowUpDown, Upload, Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface TableEditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

interface Column {
  id: string;
  name: string;
  sortable: boolean;
}

interface Row {
  id: string;
  cells: { [columnId: string]: string };
}

interface TableData {
  columns: Column[];
  rows: Row[];
}

const TableEditor: React.FC<TableEditorProps> = ({
  initialContent = '',
  pageId,
  onContentChange,
  className,
}) => {
  // Parse initialContent or set default data
  const [data, setData] = useState<TableData>(() => {
    try {
      if (initialContent) {
        return JSON.parse(initialContent);
      }
    } catch (e) {
      console.error("Failed to parse table data:", e);
    }
    
    // Default data with 2 columns and 3 rows
    return {
      columns: [
        { id: 'col-1', name: 'Column 1', sortable: true },
        { id: 'col-2', name: 'Column 2', sortable: true }
      ],
      rows: Array(3).fill(0).map((_, rowIndex) => ({
        id: `row-${rowIndex}`,
        cells: {
          'col-1': '',
          'col-2': ''
        }
      }))
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = () => {
    if (onContentChange) {
      const content = JSON.stringify(data);
      onContentChange(content);
      toast({
        title: "Changes saved",
        description: "Your table has been updated"
      });
      setIsEditing(false);
    }
  };
  
  const handleCellChange = (rowId: string, columnId: string, value: string) => {
    setData(prev => {
      const newData = { ...prev };
      const rowIndex = newData.rows.findIndex(r => r.id === rowId);
      if (rowIndex !== -1) {
        newData.rows[rowIndex] = {
          ...newData.rows[rowIndex],
          cells: {
            ...newData.rows[rowIndex].cells,
            [columnId]: value
          }
        };
      }
      return newData;
    });
    setIsEditing(true);
  };
  
  const handleColumnNameChange = (columnId: string, name: string) => {
    setData(prev => {
      const newData = { ...prev };
      const columnIndex = newData.columns.findIndex(c => c.id === columnId);
      if (columnIndex !== -1) {
        newData.columns[columnIndex] = {
          ...newData.columns[columnIndex],
          name
        };
      }
      return newData;
    });
    setIsEditing(true);
  };
  
  const addColumn = () => {
    setData(prev => {
      const newColumnId = `col-${Date.now()}`;
      
      // Add new column
      const newColumns = [...prev.columns, {
        id: newColumnId,
        name: `Column ${prev.columns.length + 1}`,
        sortable: true
      }];
      
      // Update rows with new column
      const newRows = prev.rows.map(row => ({
        ...row,
        cells: {
          ...row.cells,
          [newColumnId]: ''
        }
      }));
      
      return {
        columns: newColumns,
        rows: newRows
      };
    });
    setIsEditing(true);
  };
  
  const addRow = () => {
    setData(prev => {
      // Create empty cells for all columns
      const cells: { [columnId: string]: string } = {};
      prev.columns.forEach(column => {
        cells[column.id] = '';
      });
      
      const newRow: Row = {
        id: `row-${Date.now()}`,
        cells
      };
      
      return {
        ...prev,
        rows: [...prev.rows, newRow]
      };
    });
    setIsEditing(true);
  };
  
  const removeRow = (rowId: string) => {
    setData(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== rowId)
    }));
    setIsEditing(true);
  };
  
  const removeColumn = (columnId: string) => {
    setData(prev => {
      // Remove column
      const newColumns = prev.columns.filter(column => column.id !== columnId);
      
      // Update rows
      const newRows = prev.rows.map(row => {
        const newCells = { ...row.cells };
        delete newCells[columnId];
        
        return {
          ...row,
          cells: newCells
        };
      });
      
      return {
        columns: newColumns,
        rows: newRows
      };
    });
    setIsEditing(true);
  };
  
  const toggleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };
  
  // CSV Export function
  const exportCSV = () => {
    // Create header row with column names
    const headerRow = data.columns.map(col => `"${col.name.replace(/"/g, '""')}"`).join(',');
    
    // Create data rows
    const dataRows = data.rows.map(row => {
      return data.columns.map(col => {
        const cellValue = row.cells[col.id] || '';
        return `"${cellValue.replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    // Combine all rows
    const csvContent = [headerRow, ...dataRows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'table-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "CSV exported",
      description: "Your table has been exported as CSV"
    });
  };

  // CSV Import function
  const importCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n').map(line => 
          line.split(',').map(cell => 
            cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
          )
        );
        
        if (lines.length < 2) {
          throw new Error("CSV file must contain at least a header row and one data row");
        }
        
        // Extract headers from first line
        const headers = lines[0];
        
        // Create column structure
        const newColumns: Column[] = headers.map((header, index) => ({
          id: `col-${index}`,
          name: header,
          sortable: true
        }));
        
        // Create rows
        const newRows: Row[] = lines.slice(1)
          .filter(line => line.length === headers.length && line.some(cell => cell.trim() !== ''))
          .map((line, rowIndex) => {
            const cells: { [key: string]: string } = {};
            line.forEach((cell, cellIndex) => {
              cells[`col-${cellIndex}`] = cell;
            });
            
            return {
              id: `row-${Date.now()}-${rowIndex}`,
              cells
            };
          });
        
        // Update state
        setData({
          columns: newColumns,
          rows: newRows
        });
        setIsEditing(true);
        
        toast({
          title: "CSV imported",
          description: `Imported ${newRows.length} rows and ${newColumns.length} columns`
        });
        
      } catch (error) {
        console.error("CSV import error:", error);
        toast({
          title: "Import failed",
          description: "There was a problem importing your CSV file",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
    
    // Reset the input to allow importing the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Sort data
  let sortedRows = [...data.rows];
  if (sortColumn) {
    sortedRows.sort((a, b) => {
      const aValue = a.cells[sortColumn] || '';
      const bValue = b.cells[sortColumn] || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background">
        <div className="flex items-center gap-2">
          <TableIcon className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Table Editor</span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
          <Button variant="outline" onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>

          <div className="flex items-center gap-1">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={importCSV}
              style={{ display: 'none' }}
            />
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Button onClick={handleSave} disabled={!isEditing}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {data.columns.length === 0 ? (
          <div className="text-center py-12">
            <TableIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No Table Data</h2>
            <p className="text-muted-foreground mb-4">
              Start by adding columns and rows to your table or import a CSV file.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={addColumn}>
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  {data.columns.map(column => (
                    <th key={column.id} className="border-r last:border-r-0 p-0">
                      <div className="relative min-w-[150px]">
                        <div className="flex items-center p-2">
                          <Input
                            value={column.name}
                            onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                            className="border-0 focus:ring-0 bg-transparent h-7 px-1"
                          />
                          
                          {column.sortable && (
                            <button
                              onClick={() => toggleSort(column.id)}
                              className={cn(
                                "ml-2 h-5 w-5 flex items-center justify-center rounded hover:bg-muted",
                                sortColumn === column.id ? "text-primary" : "text-muted-foreground"
                              )}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => removeColumn(column.id)}
                            className="ml-1 h-5 w-5 flex items-center justify-center rounded hover:bg-red-100 text-muted-foreground hover:text-red-500"
                          >
                            <Delete className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.id} className="border-t">
                    {data.columns.map(column => (
                      <td key={`${row.id}-${column.id}`} className="border-r last:border-r-0 p-0">
                        <Input
                          value={row.cells[column.id] || ''}
                          onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
                          className="border-0 focus:ring-0 h-10 px-2"
                        />
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

export default TableEditor;
