import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

const reportSchema = z.object({
    description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres").max(500, "A descrição deve ter no máximo 500 caracteres"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (description: string) => Promise<void>;
    equipmentName?: string;
}

export const ReportModal = ({ isOpen, onClose, onSubmit, equipmentName }: ReportModalProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
    });

    const handleFormSubmit = async (data: ReportFormValues) => {
        await onSubmit(data.description);
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-2">Reportar Problema</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Descreva o defeito encontrado no equipamento <span className="font-semibold text-slate-900">{equipmentName}</span>.
                </p>

                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="mb-4">
                        <textarea
                            {...register('description')}
                            className={`w-full border rounded-lg p-3 text-sm h-32 focus:ring-2 focus:outline-none transition-all
                ${errors.description ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'}
              `}
                            placeholder="Ex: Cabo com chiado, Botão travado..."
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => { reset(); onClose(); }}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                            Reportar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
