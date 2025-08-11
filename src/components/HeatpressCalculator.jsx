import { useEffect, useRef } from 'react';
import Papa from 'papaparse';

const HeatpressCalculator = () => {
  const fileInputRef = useRef(null);

  // localStorage functions
  const saveToLocalStorage = () => {
    try {
      const getValue = (tableId, rowIndex) => {
        const table = document.getElementById(tableId);
        if (table && table.rows[rowIndex]) {
          return parseFloat(table.rows[rowIndex].cells[1].innerText) || 0;
        }
        return 0;
      };

      const data = {
        inputs: {
          shirtCost: getValue("perShirtTable", 0),
          dtfPerMeter: getValue("perShirtTable", 1),
          shirtsPerMeter: getValue("perShirtTable", 2),
          packaging: getValue("perShirtTable", 3),
          electricityMonth: getValue("monthlyTable", 0),
          shirtsPerMonth: getValue("monthlyTable", 1),
          sellingPrice: getValue("monthlyTable", 2),
          heatpressCost: getValue("equipmentTable", 0),
          qtySold: getValue("equipmentTable", 1)
        },
        timestamp: new Date().toISOString(),
        version: "1.0"
      };

      localStorage.setItem('metrosevn-accounting-calculator', JSON.stringify(data));
      console.log('Data auto-saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('metrosevn-accounting-calculator');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Populate inputs
        const setTableValue = (tableId, rowIndex, value) => {
          const table = document.getElementById(tableId);
          if (table && table.rows[rowIndex]) {
            table.rows[rowIndex].cells[1].innerText = value;
          }
        };

        setTableValue("perShirtTable", 0, data.inputs.shirtCost);
        setTableValue("perShirtTable", 1, data.inputs.dtfPerMeter);
        setTableValue("perShirtTable", 2, data.inputs.shirtsPerMeter);
        setTableValue("perShirtTable", 3, data.inputs.packaging);
        setTableValue("monthlyTable", 0, data.inputs.electricityMonth);
        setTableValue("monthlyTable", 1, data.inputs.shirtsPerMonth);
        setTableValue("monthlyTable", 2, data.inputs.sellingPrice);
        setTableValue("equipmentTable", 0, data.inputs.heatpressCost);
        setTableValue("equipmentTable", 1, data.inputs.qtySold);

        console.log('Data loaded from localStorage');
        return true;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return false;
  };

  // CSV Export using PapaParse
  const exportToCSV = () => {
    try {
      const getValue = (tableId, rowIndex) => {
        const table = document.getElementById(tableId);
        if (table && table.rows[rowIndex]) {
          return parseFloat(table.rows[rowIndex].cells[1].innerText) || 0;
        }
        return 0;
      };

      const getResultValue = (elementId) => {
        const element = document.getElementById(elementId);
        return element ? element.textContent.replace(/[₱,]/g, '') : '0';
      };

      // Prepare data for CSV
      const csvData = [
        // Input data
        { Category: 'Per-Shirt Costs', Field: 'Shirt Cost', Value: getValue("perShirtTable", 0), Type: 'Input' },
        { Category: 'Per-Shirt Costs', Field: 'DTF per Meter', Value: getValue("perShirtTable", 1), Type: 'Input' },
        { Category: 'Per-Shirt Costs', Field: 'Shirts per Meter', Value: getValue("perShirtTable", 2), Type: 'Input' },
        { Category: 'Per-Shirt Costs', Field: 'Packaging', Value: getValue("perShirtTable", 3), Type: 'Input' },
        { Category: 'Monthly Operations', Field: 'Electricity Cost', Value: getValue("monthlyTable", 0), Type: 'Input' },
        { Category: 'Monthly Operations', Field: 'Production Capacity', Value: getValue("monthlyTable", 1), Type: 'Input' },
        { Category: 'Monthly Operations', Field: 'Selling Price', Value: getValue("monthlyTable", 2), Type: 'Input' },
        { Category: 'Investment', Field: 'Heatpress Cost', Value: getValue("equipmentTable", 0), Type: 'Input' },
        { Category: 'Investment', Field: 'Total Sold to Date', Value: getValue("equipmentTable", 1), Type: 'Input' },
        
        // Results data
        { Category: 'Results', Field: 'Profit per Shirt', Value: getResultValue("profitPerShirt"), Type: 'Result' },
        { Category: 'Results', Field: 'Profit Margin', Value: getResultValue("profitMargin"), Type: 'Result' },
        { Category: 'Results', Field: 'COGS', Value: getResultValue("cogs"), Type: 'Result' },
        { Category: 'Results', Field: 'DTF Cost per Shirt', Value: getResultValue("dtfPerShirt"), Type: 'Result' },
        { Category: 'Results', Field: 'Electricity per Shirt', Value: getResultValue("electricityPerShirt"), Type: 'Result' },
        { Category: 'Results', Field: 'Monthly Profit', Value: getResultValue("monthlyProfit"), Type: 'Result' },
        { Category: 'Results', Field: 'Monthly Break-even Qty', Value: getResultValue("monthlyBreakEvenQty"), Type: 'Result' },
        { Category: 'Results', Field: 'Current ROI', Value: getResultValue("roi"), Type: 'Result' },
        { Category: 'Results', Field: 'Total Profit', Value: getResultValue("netIncome"), Type: 'Result' },
        { Category: 'Results', Field: 'Break-even Qty', Value: getResultValue("breakEvenQty"), Type: 'Result' },
        { Category: 'Results', Field: 'Business Status', Value: document.getElementById("status")?.textContent || '-', Type: 'Result' }
      ];

      // Add metadata
      csvData.unshift({
        Category: 'Metadata',
        Field: 'Export Date',
        Value: new Date().toISOString(),
        Type: 'Meta'
      });

      // Convert to CSV using PapaParse
      const csv = Papa.unparse(csvData);
      
      // Download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `metrosevn-accounting-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ CSV exported successfully!');
    } catch (error) {
      alert('❌ Error exporting CSV: ' + error.message);
    }
  };

  // CSV Import using PapaParse
  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data;
          
          // Field mappings for import
          const fieldMappings = {
            "Shirt Cost": ["perShirtTable", 0],
            "DTF per Meter": ["perShirtTable", 1],
            "Shirts per Meter": ["perShirtTable", 2],
            "Packaging": ["perShirtTable", 3],
            "Electricity Cost": ["monthlyTable", 0],
            "Production Capacity": ["monthlyTable", 1],
            "Selling Price": ["monthlyTable", 2],
            "Heatpress Cost": ["equipmentTable", 0],
            "Total Sold to Date": ["equipmentTable", 1]
          };

          // Process imported data
          data.forEach(row => {
            if (row.Type === 'Input' && row.Field && row.Value && fieldMappings[row.Field]) {
              const [tableId, rowIndex] = fieldMappings[row.Field];
              const table = document.getElementById(tableId);
              if (table && table.rows[rowIndex]) {
                table.rows[rowIndex].cells[1].innerText = row.Value;
              }
            }
          });

          // Trigger calculation and save
          setTimeout(() => {
            const firstEditableCell = document.querySelector('[contentEditable="true"]');
            if (firstEditableCell) {
              const event = new Event('input', { bubbles: true });
              firstEditableCell.dispatchEvent(event);
            }
            saveToLocalStorage();
          }, 100);

          alert('✅ CSV imported successfully!');
        } catch (error) {
          alert('❌ Error importing CSV: ' + error.message);
        }
      },
      error: (error) => {
        alert('❌ Error parsing CSV: ' + error.message);
      }
    });

    // Reset file input
    event.target.value = '';
  };

  // Clear data function
  const clearData = () => {
    if (confirm('Are you sure you want to clear all data? This will reset to default values.')) {
      localStorage.removeItem('metrosevn-accounting-calculator');
      
      // Reset to default values
      const setTableValue = (tableId, rowIndex, value) => {
        const table = document.getElementById(tableId);
        if (table && table.rows[rowIndex]) {
          table.rows[rowIndex].cells[1].innerText = value;
        }
      };

      setTableValue("perShirtTable", 0, 115);
      setTableValue("perShirtTable", 1, 250);
      setTableValue("perShirtTable", 2, 5);
      setTableValue("perShirtTable", 3, 20);
      setTableValue("monthlyTable", 0, 500);
      setTableValue("monthlyTable", 1, 50);
      setTableValue("monthlyTable", 2, 250);
      setTableValue("equipmentTable", 0, 11000);
      setTableValue("equipmentTable", 1, 0);

      // Trigger calculation
      setTimeout(() => {
        const firstEditableCell = document.querySelector('[contentEditable="true"]');
        if (firstEditableCell) {
          const event = new Event('input', { bubbles: true });
          firstEditableCell.dispatchEvent(event);
        }
      }, 100);

      alert('✅ Data cleared and reset to defaults!');
    }
  };

  useEffect(() => {
    // Exact same calculation functions from the working HTML
    function getValue(tableId, rowIndex) {
      return parseFloat(document.getElementById(tableId).rows[rowIndex].cells[1].innerText) || 0;
    }

    function calculate() {
      // Get inputs
      const shirt = getValue("perShirtTable", 0);
      const dtfMeter = getValue("perShirtTable", 1);
      const dtfPerMeter = getValue("perShirtTable", 2);
      const packaging = getValue("perShirtTable", 3);
      
      const electricityMonth = getValue("monthlyTable", 0);
      const shirtsPerMonth = getValue("monthlyTable", 1);
      const price = getValue("monthlyTable", 2);
      
      const heatpress = getValue("equipmentTable", 0);
      const qtySold = getValue("equipmentTable", 1);

      // Calculations
      const dtfPerShirt = dtfMeter / dtfPerMeter;
      const elecPerShirt = electricityMonth / shirtsPerMonth;
      const cogs = shirt + dtfPerShirt + elecPerShirt + packaging;
      const profit = price - cogs;
      const margin = (profit / price) * 100;
      const breakEvenQty = profit > 0 ? Math.ceil(heatpress / profit) : "N/A";
      const income = profit * qtySold;
      const roi = heatpress > 0 ? (income / heatpress) * 100 : 0;
      const monthlyBreakEven = profit > 0 ? Math.ceil(electricityMonth / profit) : "N/A";
      const monthlyProfit = profit * shirtsPerMonth;

      // Status logic
      const isProfitable = profit > 0;
      const status = isProfitable ? "✅ Profitable" : "❌ Loss";
      
      let monthlyStatus = "";
      let statusClass = "";
      if (isProfitable) {
        if (shirtsPerMonth >= monthlyBreakEven) {
          const surplus = shirtsPerMonth - monthlyBreakEven;
          monthlyStatus = `✅ +${surplus} shirts surplus`;
          statusClass = "text-green-700 bg-green-100 p-3 rounded-lg text-center text-sm font-medium";
        } else {
          const shortage = monthlyBreakEven - shirtsPerMonth;
          monthlyStatus = `⚠️ Need ${shortage} more`;
          statusClass = "text-yellow-700 bg-yellow-100 p-3 rounded-lg text-center text-sm font-medium";
        }
      } else {
        monthlyStatus = "❌ Unprofitable";
        statusClass = "text-red-700 bg-red-100 p-3 rounded-lg text-center text-sm font-medium";
      }

      // Update UI
      const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
      };

      updateElement("dtfPerShirt", "₱" + dtfPerShirt.toFixed(2));
      updateElement("electricityPerShirt", "₱" + elecPerShirt.toFixed(2));
      updateElement("cogs", "₱" + cogs.toFixed(2));
      updateElement("profitPerShirt", "₱" + profit.toFixed(2));
      updateElement("profitMargin", margin.toFixed(1) + "%");
      updateElement("breakEvenQty", breakEvenQty);
      updateElement("netIncome", "₱" + income.toLocaleString());
      updateElement("roi", roi.toFixed(1) + "%");
      updateElement("monthlyBreakEvenQty", monthlyBreakEven);
      updateElement("monthlyProfit", "₱" + monthlyProfit.toLocaleString());
      updateElement("monthlyStatus", monthlyStatus);
      updateElement("status", status);

      // Apply styling
      const statusBox = document.getElementById("statusBox");
      const monthlyStatusBox = document.getElementById("monthlyStatusBox");
      
      if (statusBox) {
        statusBox.className = "text-center p-4 rounded-lg bg-gray-50 " + (isProfitable ? "bg-green-100" : "bg-red-100");
      }
      if (monthlyStatusBox) {
        monthlyStatusBox.className = statusClass;
      }

      // Auto-save to localStorage after calculation
      saveToLocalStorage();
    }

    // Load saved data first
    const dataLoaded = loadFromLocalStorage();
    
    // Add event listeners - exactly like the HTML version
    const handleInput = () => {
      // Debounce the save to avoid too frequent localStorage writes
      clearTimeout(window.saveTimer);
      window.saveTimer = setTimeout(calculate, 200);
    };

    document.querySelectorAll('[contentEditable="true"]').forEach(cell => {
      cell.addEventListener("input", handleInput);
    });

    // Initial calculation
    setTimeout(calculate, dataLoaded ? 200 : 100);

    // Cleanup
    return () => {
      document.querySelectorAll('[contentEditable="true"]').forEach(cell => {
        cell.removeEventListener("input", handleInput);
      });
      clearTimeout(window.saveTimer);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
         MetroSevn Accounting Dashboard
      </h1>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
        >
          📁 Import CSV
        </button>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
        >
          💾 Export CSV
        </button>
        <button
          onClick={clearData}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
        >
          🗑️ Clear Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={importFromCSV}
          className="hidden"
        />
      </div>

      {/* Auto-save indicator */}
      <div className="text-center mb-6">
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
          💾 Auto-saves to localStorage
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT SECTIONS */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">🟡 Per-Shirt Costs</h2>
          <table id="perShirtTable" className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">Shirt cost</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">100</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">DTF per meter</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">350</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">Shirts per meter</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">6</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">Packaging</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">5</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">🔵 Monthly Operations</h2>
          <table id="monthlyTable" className="w-full border-collapse mb-6">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">Electricity cost</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">500</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">Production capacity</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">100</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">Selling price</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">250</td>
              </tr>
            </tbody>
          </table>
          
          <h2 className="text-lg font-semibold mb-4 text-gray-700">🔴 Investment</h2>
          <table id="equipmentTable" className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">Heatpress cost</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">11000</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-sm">Total sold to date</td>
                <td contentEditable="true" className="px-2 py-1 bg-yellow-50 cursor-text border border-yellow-200 rounded">150</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* RESULTS SECTIONS */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">📊 Per-Shirt Analysis</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div id="profitPerShirt" className="text-xl font-bold mb-2">₱0</div>
              <div className="text-sm text-gray-600">Profit per Shirt</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div id="profitMargin" className="text-xl font-bold mb-2">0%</div>
              <div className="text-sm text-gray-600">Profit Margin</div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span>COGS</span>
              <span id="cogs" className="font-medium">₱0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span>DTF cost</span>
              <span id="dtfPerShirt" className="font-medium">₱0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span>Electricity</span>
              <span id="electricityPerShirt" className="font-medium">₱0</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">📈 Monthly Performance</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div id="monthlyProfit" className="text-xl font-bold mb-2">₱0</div>
              <div className="text-sm text-gray-600">Monthly Profit</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div id="monthlyBreakEvenQty" className="text-xl font-bold mb-2">0</div>
              <div className="text-sm text-gray-600">Min. Sales Needed</div>
            </div>
          </div>
          <div id="monthlyStatusBox" className="p-3 rounded-lg text-center text-sm font-medium bg-gray-100">
            <span id="monthlyStatus">-</span>
          </div>
        </div>

        {/* ROI SECTION */}
        <div className="bg-white rounded-lg p-6 shadow-lg lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6 text-gray-700">💰 Investment ROI</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div id="roi" className="text-xl font-bold mb-2">0%</div>
              <div className="text-sm text-gray-600">Current ROI</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div id="netIncome" className="text-xl font-bold mb-2">₱0</div>
              <div className="text-sm text-gray-600">Total Profit</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div id="breakEvenQty" className="text-xl font-bold mb-2">0</div>
              <div className="text-sm text-gray-600">Break-even Qty</div>
            </div>
            <div id="statusBox" className="text-center p-4 rounded-lg bg-gray-50">
              <div id="status" className="text-xl font-bold mb-2">-</div>
              <div className="text-sm text-gray-600">Business Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatpressCalculator;