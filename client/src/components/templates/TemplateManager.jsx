import React, { useState, useEffect } from "react";
import { PlusIcon, CheckIcon, EditIcon, TrashIcon } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function TemplateManager({ invoiceData, onSelectTemplate, onCreateTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [filterType, setFilterType] = useState("all");

  const filteredTemplates = templates.filter((t) =>
    filterType === "all" ? true : t.type === filterType
  );

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(
          `https://air-invoice-server.vercel.app/template/getAllTemplates`
        );
        setTemplates(res.data);
        const defaultTemplate = res.data.find((t) => t.isDefault);
        if (defaultTemplate) setSelectedTemplateId(defaultTemplate._id);
        setLoading(false)
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false)
      }
    };
    fetchTemplates();
  }, []);

  const handleSetDefault = async (templateId) => {
    try {
      const updatedTemplates = templates.map((template) =>
        template._id === templateId
          ? { ...template, isDefault: true }
          : { ...template, isDefault: false }
      );

      await Promise.all(
        updatedTemplates.map((template) =>
          axios.put(
            `https://air-invoice-server.vercel.app/template/updateTemplate/${template._id}`,
            {
              isDefault: template.isDefault,
            }
          )
        )
      );

      setTemplates(updatedTemplates);
      setSelectedTemplateId(templateId);
    } catch (err) {
      console.error("Failed to update default template:", err);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await axios.delete(
          `https://air-invoice-server.vercel.app/template/deleteTemplate/${templateId}`
        );
        setTemplates((prev) =>
          prev.filter((template) => template._id !== templateId)
        );
        if (selectedTemplateId === templateId) {
          setSelectedTemplateId(null);
        }
        toast.success("Template deleted.");
      } catch (err) {
        console.error("Failed to delete template:", err);
        toast.error("Failed to delete template");
      }
    }
  };

  const handleSelectTemplate = () => {
    const selectedTemplate = templates.find(
      (t) => t._id === selectedTemplateId
    );
    if (!selectedTemplate) return;
    navigate(`/dashboard/template-editor/${selectedTemplate._id}`);
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Invoice & Quotation Templates
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Select a template to use for your new invoice / quotation or create a new template.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
            >
              <div className="h-32 bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="flex items-center justify-between mt-2">
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="flex gap-2">
                    <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex sm:flex-row flex-col justify-between items-center sm:mb-0 mb-10">
        <div className="mb-10 w-full flex items-center sm:justify-between justify-center flex-wrap gap-4">
          <div className="space-y-4 sm:text-left text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Invoice & Quotation Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Select a template to use for your new invoice / quotation or create a new template.
            </p>
          </div>
          <div className="flex border rounded-md overflow-hidden shadow-sm transition-all bg-gray-100 dark:bg-gray-700">
            {["all", "invoice", "quotation"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${filterType === type
                  ? "bg-blue-600 text-white border border-blue-400"
                  : "bg-gray-100 hover:bg-blue-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          {invoiceData && (
            <div className="flex justify-end">
              <button
                onClick={handleSelectTemplate}
                disabled={!selectedTemplateId}
                className={`px-6 py-2 rounded-md ${selectedTemplateId
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Use Selected Template
              </button>
            </div>
          )}
        </div>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Create New Template Card */}
        <div
          onClick={onCreateTemplate}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 dark:hover:border-blue-400 transition-colors h-full"
        >
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 mb-4">
            <PlusIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-medium text-gray-800 dark:text-white mb-1">
            Create New Template
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Design a custom template for your business
          </p>
        </div>

        {/* Template Cards */}
        {paginatedTemplates.map((template) => (
          <div
            key={template._id}
            onClick={() => setSelectedTemplateId(template._id)}
            className={`relative border rounded-lg overflow-hidden transition-all ${selectedTemplateId === template._id && invoiceData
              ? "cursor-pointer ring-2 ring-blue-500 border-transparent"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-400 bg-white dark:bg-gray-800"
              }`}
          >
            {/* Template Preview Image */}
            <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
              <img
                src={
                  template.company.logo ||
                  "https://via.placeholder.com/300x200.png?text=No+Preview"
                }
                alt={template.name}
                className="w-full h-full object-cover"
              />
              {template.isDefault && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Default
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-800 dark:text-white">
                {template.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {template.description}
              </p>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-between">
                {!invoiceData && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(template._id);
                    }}
                    className={`text-sm ${template.isDefault
                      ? "text-blue-600 dark:text-blue-400 cursor-default"
                      : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                  >
                    <div className="flex items-center">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Set as Default
                    </div>
                  </button>
                )}

                {!invoiceData && (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/template-editor/${template._id}`);
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template._id);
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Selection Overlay */}
            {selectedTemplateId === template._id && invoiceData && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-10 dark:bg-blue-500 dark:bg-opacity-20 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
                  <CheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {templates.length > itemsPerPage && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-2 text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default TemplateManager;
