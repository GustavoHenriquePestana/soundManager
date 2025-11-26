import React from 'react';
import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

export const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="text-center">
                <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center">
                        <HelpCircle className="text-slate-400" size={48} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg">
                        <span className="text-2xl">🤔</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 mb-4">Página não encontrada</h1>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    A página que você está procurando não existe ou foi movida.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    <Home size={20} />
                    Voltar para o Início
                </Link>
            </div>
        </div>
    );
};
